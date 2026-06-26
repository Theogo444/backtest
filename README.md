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

L'application utilise un **jeu de données de démonstration** généré localement et de façon
déterministe (`src/data/defaultAssets.js`) : séries mensuelles 2000–2026 pour le S&P 500, MSCI World,
CAC 40, Nasdaq 100, Or et Livret A, avec krachs historiques reproduits (2000, 2008, 2020, 2022).

Un appel à **Yahoo Finance** est prévu (`src/hooks/useMarketData.js`, `fetchYahooHistory`) mais
désactivé par défaut (CORS navigateur) — à brancher via un proxy/backend pour des données temps réel.

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
