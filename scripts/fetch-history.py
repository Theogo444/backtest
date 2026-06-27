#!/usr/bin/env python3
# ============================================================================
#  fetch-history.py  (one-shot / occasionnel)
#  Récupère l'historique MENSUEL réel long terme (depuis 2000) des 56 actifs
#  via yfinance, et l'écrit dans public/data/history.json.
#
#  Pourquoi Python/yfinance et pas le quotidien sur GitHub Actions ?
#  ----------------------------------------------------------------
#  yfinance gère proprement la session Yahoo (cookie + crumb) et récupère les
#  56 tickers en un seul yf.download — là où des appels bruts se font
#  rate-limiter (HTTP 429). À lancer depuis une IP « propre » (poste perso) :
#  les IP datacenter de GitHub Actions sont, elles, bloquées par Yahoo. La
#  fraîcheur QUOTIDIENNE reste donc gérée par Marketstack (scripts/update-quotes.mjs)
#  et greffée par-dessus cet historique ; ce script ne sert qu'au gros pull
#  d'historique (à relancer de temps en temps pour l'étendre).
#
#  Le résultat (history.json) est consommé par useMarketData.mergeRealHistory :
#  il remplace les séries synthétiques par le réel, en gardant le calendrier.
#
#  Usage :
#    pip3 install yfinance pandas
#    python3 scripts/fetch-history.py
#
#  La table id→ticker reflète src/data/defaultAssets.js (source de vérité).
# ============================================================================

import json
import os
import sys

try:
    import yfinance as yf
except ImportError:
    sys.exit("yfinance manquant → pip3 install yfinance pandas")

OUT = os.path.join("public", "data", "history.json")
START = "1999-12-01"  # couvre le calendrier de l'app (2000 → aujourd'hui)
MIN_POINTS = 12

# id → ticker Yahoo (miroir de src/data/defaultAssets.js)
TICKERS = {
    "sp500": "^GSPC",
    "msci-world": "URTH",
    "cac40": "^FCHI",
    "nasdaq100": "^NDX",
    "gold": "GC=F",
    "msci-em": "IEMG",
    "stoxx600": "EXSA.DE",
    "eurostoxx50": "^STOXX50E",
    "world-esg": "SUSW.L",
    "russell2000": "IWM",
    "topix": "1306.T",  # ETF TOPIX (l'indice ^TPX n'est pas servi par Yahoo)
    "msci-india": "INDA",
    "world-tech": "XDWT.DE",
    "clean-energy": "ICLN",
    "oblig-euro": "IEAG.AS",
    "apple": "AAPL",
    "microsoft": "MSFT",
    "amazon": "AMZN",
    "alphabet": "GOOGL",
    "nvidia": "NVDA",
    "tesla": "TSLA",
    "meta": "META",
    "coca-cola": "KO",
    "jnj": "JNJ",
    "jpmorgan": "JPM",
    "visa": "V",
    "berkshire": "BRK-B",
    "mcdonalds": "MCD",
    "lvmh": "MC.PA",
    "hermes": "RMS.PA",
    "totalenergies": "TTE.PA",
    "loreal": "OR.PA",
    "sanofi": "SAN.PA",
    "airbus": "AIR.PA",
    "airliquide": "AI.PA",
    "schneider": "SU.PA",
    "bnp": "BNP.PA",
    "asml": "ASML.AS",
    "sap": "SAP.DE",
    "siemens": "SIE.DE",
    "volkswagen": "VOW3.DE",
    "allianz": "ALV.DE",
    "inditex": "ITX.MC",
    "novonordisk": "NOVO-B.CO",
    "ferrari": "RACE.MI",
    "nestle": "NESN.SW",
    "novartis": "NOVN.SW",
    "roche": "RO.SW",  # ticker Yahoo réel de Roche (ROG.SW renvoie 404)
    "shell": "SHEL.L",
    "astrazeneca": "AZN.L",
    "hsbc": "HSBA.L",
    "toyota": "7203.T",
    "tsmc": "TSM",
    "samsung": "005930.KS",
    "alibaba": "BABA",
    "tencent": "0700.HK",
}


def main():
    symbols = list(dict.fromkeys(TICKERS.values()))
    print(f"Téléchargement de {len(symbols)} tickers (mensuel, depuis {START})…")

    # auto_adjust=False → 'Close' ajusté des splits mais PAS des dividendes,
    # cohérent avec le modèle de l'app (prix + dividendes réinvestis à part).
    df = yf.download(
        symbols,
        start=START,
        interval="1mo",
        auto_adjust=False,
        progress=False,
        threads=True,
    )
    if df is None or df.empty:
        sys.exit("Aucune donnée renvoyée (rate-limit ?). Réessayer depuis une IP propre.")

    close = df["Close"]
    # Cas mono-ticker : close est une Series → on la remet en DataFrame.
    if hasattr(close, "to_frame") and "name" in dir(close) and close.ndim == 1:
        close = close.to_frame()

    history = {}
    ok, fail = 0, 0
    for asset_id, ticker in TICKERS.items():
        try:
            serie = close[ticker].dropna() if ticker in close.columns else None
        except Exception:
            serie = None
        if serie is None or len(serie) < MIN_POINTS:
            fail += 1
            print(f"✗ {asset_id:14} ({ticker}) : indisponible")
            continue
        pts = []
        for ts, val in serie.items():
            # Normalise au 1er du mois
            date = f"{ts.year:04d}-{ts.month:02d}-01"
            pts.append({"date": date, "close": round(float(val), 4)})
        # Dédoublonnage par mois (le dernier gagne), tri croissant
        by_month = {p["date"]: p["close"] for p in pts}
        pts = [{"date": d, "close": c} for d, c in sorted(by_month.items())]
        history[asset_id] = pts
        ok += 1
        print(f"✓ {asset_id:14} ({ticker}) : {len(pts)} mois, {pts[0]['date']} → {pts[-1]['date']}")

    if ok == 0:
        sys.exit("Aucune série exploitable.")

    from datetime import datetime, timezone
    payload = {
        "updated": datetime.now(timezone.utc).isoformat(),
        "source": "yahoo",
        "history": history,
    }
    os.makedirs(os.path.dirname(OUT), exist_ok=True)
    with open(OUT, "w") as f:
        json.dump(payload, f)
    print(f"\n✓ {ok} actifs écrits dans {OUT} ({fail} échecs).")


if __name__ == "__main__":
    main()
