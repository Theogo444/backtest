# Simulateur de Portefeuille — référentiel projet

## Stack
React 18 + Vite · TailwindCSS 3 · Recharts · lucide-react · tout côté client (pas de backend) · déployé sur Vercel.

## Pages (SPA)
1. **Simulateur** — backtest multi-actifs, 8 stratégies (Lump Sum, DCA, Value Averaging, DCA dynamique, Buy & Hold, Rééquilibrage, Stock Picking, Momentum), métriques (CAGR, Sharpe, Max Drawdown, volatilité) + graphiques Recharts.
2. **Comparateur d'enveloppes** — impact fiscal PEA / CTO / Assurance-vie + boutons affiliation (liens placeholder à remplacer dans `EnvelopeComparator.jsx`).
3. **Objectif retraite** — effort mensuel, trajectoire capital, scénarios pess/neutre/opti.
4. **Monte Carlo** — 100–5000 trajectoires, éventail percentiles, probabilité d'objectif.
5. **Glossaire** — 17 définitions accordéon, balisage `schema.org/FAQPage`.

## Architecture des données (3 couches)
| Couche | Fichier | Rôle |
|--------|---------|------|
| Synthétique (fallback) | `src/data/defaultAssets.js` | Séries mensuelles 2000–2026 déterministes |
| Historique réel | `public/data/history.json` | Clôtures mensuelles réelles ~25 ans, 56 actifs (yfinance) |
| Cours récents | `public/data/quotes.json` | Greffage quotidien (Marketstack, manuel) |

`useMarketData.mergeRealHistory` fusionne les couches à l'identique du calendrier mensuel du moteur.

## Actualisation quotidienne (cron local Mac)
- **Pourquoi local ?** Yahoo bloque les IP datacenter GitHub Actions ; Marketstack gratuit facture par symbole (100/mois, impossible pour 56 actifs/jour).
- **Script** : `~/Library/Application Support/backtest/daily-refresh.sh` (copie de `scripts/daily-refresh.sh`)  
  → exécute `scripts/fetch-history.py` (yfinance, 56 tickers en 1 appel) puis commit/push `history.json` si changé.
- **Agent launchd** : `~/Library/LaunchAgents/com.backtest.daily-refresh.plist` · déclenchement **08h30 chaque jour**.
- **⚠️ TCC macOS** : launchd refuse d'exécuter un script dans `~/Desktop/` → le script doit rester dans `~/Library/Application Support/backtest/` (hors dossier protégé), mais peut `cd` dans le dépôt du Bureau.
- Logs : `~/Library/Logs/backtest-refresh.log`

## Réinstallation du cron (si besoin)
```bash
mkdir -p ~/Library/Application\ Support/backtest
cp scripts/daily-refresh.sh ~/Library/Application\ Support/backtest/
chmod +x ~/Library/Application\ Support/backtest/daily-refresh.sh
cp scripts/com.backtest.daily-refresh.plist ~/Library/LaunchAgents/
launchctl bootstrap gui/$(id -u) ~/Library/LaunchAgents/com.backtest.daily-refresh.plist
launchctl kickstart -k gui/$(id -u)/com.backtest.daily-refresh  # test immédiat
```

## Monétisation
- **AdSense** : divs `ad-slot` commentés `<!-- AdSense slot: … -->` dans le layout. Script à décommenter dans `index.html`.
- **Affiliation** : `href="#affiliate-*"` placeholder dans `EnvelopeComparator.jsx` (Fortuneo PEA, Boursorama PEA+CTO, Linxea AV).

## Design
Bleu marine `#1e3a5f` · blanc · vert gains / rouge pertes · Inter · responsive mobile-first · mode sombre/clair.

## Fiscalité FR implémentée
- PEA : exonération PV après 5 ans (hors PS 17,2 %)
- CTO : flat tax 30 % (PFU) ou barème progressif
- AV : abattement 4 600 €/an après 8 ans, PS 17,2 %, impôt 7,5 % au-delà
