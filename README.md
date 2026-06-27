# Simulateur de Portefeuille — PEA, CTO, Assurance-vie 🇫🇷

Site de **simulation et backtest de portefeuille d'investissement** pour particuliers français.
Entièrement côté client (aucun backend), prêt à déployer sur **Vercel**.

## 🚀 Démarrage

```bash
npm install
npm run dev      # http://localhost:5173
```

```bash
npm run build    # build de production dans /dist
npm run preview  # prévisualise le build
```

## 🧩 Stack

- **React 18** + **Vite 5**
- **TailwindCSS 3** (mode sombre/clair, palette bleu marine)
- **Recharts** pour les graphiques
- **lucide-react** pour les icônes

## 📑 Fonctionnalités

| Page | Description |
|------|-------------|
| **Simulateur** | Backtest multi-actifs, 8 stratégies (Lump Sum, DCA, Value Averaging, DCA dynamique, Buy & Hold, Rééquilibrage, Stock Picking, Momentum), métriques (CAGR, Sharpe, Max Drawdown, volatilité…) et graphiques. |
| **Comparateur d'enveloppes** | Impact fiscal PEA / CTO / Assurance-vie sur la même simulation + liens courtiers. |
| **Objectif retraite** | Calcul de l'effort d'épargne mensuel, trajectoire du capital, scénarios pessimiste/neutre/optimiste. |
| **Monte Carlo** | Projection probabiliste (jusqu'à 5000 trajectoires), éventail des percentiles, probabilité d'objectif. |
| **Glossaire** | 17 définitions au format accordéon, balisage SEO `schema.org/FAQPage`. |

## 📊 Données de marché

Trois couches se superposent, de la plus ancienne à la plus fraîche :

1. **Historique de démonstration** (repli) — `src/data/defaultAssets.js` : séries mensuelles
   2000–2026 générées de façon déterministe, avec krachs reproduits (2000, 2008, 2020, 2022).
   Sert de base et de secours si les fichiers réels sont absents.
2. **Historique réel long terme** — `public/data/history.json` : clôtures **mensuelles réelles**
   (jusqu'à ~25 ans) des 56 actifs, récupérées via **yfinance** (cf. ci-dessous). Au chargement,
   `useMarketData.mergeRealHistory` **remplace** le synthétique par le réel là où il existe, en
   gardant le calendrier du moteur ; pour un actif récent (ETF lancé après 2000), les mois
   antérieurs gardent le synthétique **mis à l'échelle** pour se raccorder sans saut.
3. **Cours quotidiens récents** — `public/data/quotes.json` : greffés par-dessus pour la fraîcheur
   du mois en cours (cf. « Actualisation quotidienne »).

### Historique réel (one-shot, `scripts/fetch-history.py`)

```bash
pip3 install yfinance pandas
python3 scripts/fetch-history.py   # écrit public/data/history.json
```

yfinance gère la session Yahoo (cookie + crumb) et récupère les 56 tickers en un seul
`yf.download` — là où des appels bruts se font rate-limiter (HTTP 429). **À lancer depuis une IP
« propre » (poste perso)** : les IP datacenter de GitHub Actions sont bloquées par Yahoo, d'où le
choix de Marketstack pour le quotidien. Relancer ce script de temps en temps étend l'historique.

### Actualisation quotidienne (cron LOCAL sur le Mac)

La fraîcheur quotidienne est assurée par un **cron local launchd** (et non GitHub Actions) :
`scripts/fetch-history.py` doit tourner depuis une **IP « propre »** car Yahoo bloque les IP
datacenter de GitHub Actions.

- `scripts/daily-refresh.sh` : lance le pull yfinance puis **committe/pousse** `history.json` s'il a
  changé (déclenche un redéploiement Vercel). N'agit que sur ce fichier.
- `com.backtest.daily-refresh.plist` : agent launchd qui exécute le script **chaque jour à 08:30**
  (rejoué au réveil si le Mac était éteint). Installation :

```bash
cp com.backtest.daily-refresh.plist ~/Library/LaunchAgents/   # adapter les chemins absolus
launchctl bootstrap gui/$(id -u) ~/Library/LaunchAgents/com.backtest.daily-refresh.plist
# logs : ~/Library/Logs/backtest-refresh.log
```

> _Pourquoi pas GitHub Actions ?_ Yahoo bloque les IP datacenter (yfinance n'y marche pas), et le
> plan gratuit Marketstack facture **par symbole** (100/mois) → impossible de couvrir 56 actifs/jour.
> Le workflow `update-quotes.yml` (Marketstack) reste disponible en **déclenchement manuel** pour qui
> dispose d'un plan payant.

## 💰 Monétisation

- **Google AdSense** : emplacements réservés (`AdSlot`) commentés `<!-- AdSense slot: ... -->`.
  Le script AdSense est à décommenter dans `index.html`.
- **Affiliation** : boutons courtiers (Fortuneo, Boursorama, Linxea) avec liens placeholder
  à remplacer dans `src/components/comparator/EnvelopeComparator.jsx`.

## ⚠️ Avertissement

Outil **à but éducatif uniquement**. Ne constitue pas un conseil en investissement.
Les calculs fiscaux sont des simplifications pédagogiques. Les performances passées ne préjugent
pas des performances futures.

## 📂 Structure

```
src/
├── App.jsx                 # coquille : navigation, thème, état partagé
├── components/
│   ├── layout/             # Navbar, AdSlot, Footer
│   ├── simulator/          # AssetSearch, StrategySelector, ParametersPanel, Results*
│   ├── comparator/         # EnvelopeComparator
│   ├── retirement/         # RetirementPlanner
│   ├── montecarlo/         # MonteCarloSimulator
│   ├── glossary/           # Glossary
│   └── ui/                 # Tooltip, Skeleton
├── hooks/                  # useMarketData, useSimulation
├── utils/                  # strategies, metrics, fiscalite, montecarlo
└── data/                   # defaultAssets (séries + inflation INSEE)
```
