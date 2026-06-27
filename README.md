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

L'application part d'un **historique de démonstration** généré localement et de façon
déterministe (`src/data/defaultAssets.js`) : séries mensuelles 2000–2026 pour ~57 actifs (indices,
ETF et actions de référence), avec krachs historiques reproduits (2000, 2008, 2020, 2022).

### Actualisation quotidienne (cours réels)

Une **GitHub Action** (`.github/workflows/update-quotes.yml`) s'exécute chaque jour à **06:30 UTC**
(après la clôture US de la veille) :

1. `scripts/update-quotes.mjs` récupère les clôtures journalières réelles via l'API **Marketstack**
   (endpoint EOD, tous les symboles en **un seul appel** → ~30 requêtes/mois, sous le quota gratuit
   de 100/mois) pour chaque actif et les accumule dans `public/data/quotes.json` ;
2. le fichier est committé **uniquement s'il a changé**, ce qui déclenche un redéploiement Vercel.

Au chargement, `useMarketData` lit `quotes.json` et **greffe** les cours réels récents sur la fin de
l'historique synthétique, en continuité (mise à l'échelle par le premier cours collecté) et en
conservant un calendrier mensuel homogène pour le moteur de simulation. En l'absence de fichier (ou
de données), l'app retombe sur l'historique de démonstration. La source et la date d'actualisation
sont indiquées dans le pied de page.

> **Pré-requis (une seule fois)** : créer une clé gratuite sur
> [marketstack.com/signup](https://marketstack.com/signup), puis l'ajouter au dépôt GitHub dans
> **Settings → Secrets and variables → Actions → New repository secret**, nom `MARKETSTACK_API_KEY`.
> Sans cette clé, le job **échoue volontairement** (rouge) au lieu de produire un fichier vide en
> silence — un run vert garantit donc que de vrais cours ont été écrits.
>
> Déclenchement manuel possible depuis l'onglet **Actions** de GitHub (« Run workflow »).
>
> _Note : Yahoo Finance, utilisé initialement, rate-limite (HTTP 429) les requêtes par lot depuis les
> IP de GitHub Actions et ne récupérait donc rien ; d'où le passage à Marketstack._

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
