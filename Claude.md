# Prompt Claude Code — Simulateur de Portefeuille Français

## Contexte du projet

Tu vas créer un site web complet de simulation de portefeuille d'investissement, destiné à un particulier français débutant à intermédiaire qui découvre les enveloppes fiscales (PEA, CTO, Assurance-vie). Le site doit être entièrement en français, optimisé SEO, et intégrer des emplacements publicitaires Google AdSense ainsi que des liens d'affiliation vers des courtiers.

---

## Stack technique

- **Frontend** : React (Vite) + TailwindCSS
- **Graphiques** : Recharts
- **Données de marché** : Yahoo Finance API (via `yahoo-finance2` ou appels REST publics) pour les données historiques d'actifs réels
- **Hébergement cible** : Vercel (le projet doit être prêt à déployer)
- **Pas de backend** : tous les calculs se font côté client en JS
- **SEO** : balises meta, titres descriptifs, structure HTML sémantique

---

## Architecture du site

Le site est une **Single Page Application** avec une barre de navigation latérale (desktop) ou bottom nav (mobile), comprenant les onglets suivants :

1. **Simulateur** (page principale)
2. **Comparateur d'enveloppes** (PEA / CTO / Assurance-vie)
3. **Objectif retraite**
4. **Monte Carlo**
5. **Glossaire**

---

## Fonctionnalités détaillées

### 1. Simulateur principal

#### Sélection des actifs
- Recherche d'actifs par nom ou ticker (ETF, actions, indices)
- Actifs pré-chargés par défaut : CAC 40, S&P 500, MSCI World, Nasdaq 100, Or, Livret A (taux fixe)
- Possibilité d'ajouter plusieurs actifs pour créer un portefeuille multi-actifs avec allocation en %
- Rééquilibrage automatique ou non (case à cocher)

#### Périodes de backtest
Sélecteur avec les options : 1 semaine, 1 mois, 3 mois, 6 mois, 1 an, 3 ans, 5 ans, 10 ans, 20 ans, max disponible, ou période personnalisée (date début / date fin)

#### Stratégies d'investissement (sélecteur déroulant)

**a) Lump Sum**
- Investissement unique au début de la période
- Paramètre : montant initial

**b) DCA Classique (Dollar Cost Averaging)**
- Investissement d'un montant fixe à fréquence régulière
- Paramètres : montant par période, fréquence (hebdo / mensuel / trimestriel)

**c) Value Averaging**
- L'investissement varie pour que la valeur du portefeuille suive une courbe cible (ex : +500€/mois)
- Si le portefeuille dépasse la cible, on n'investit pas (ou on vend partiellement)
- Paramètres : valeur cible mensuelle, montant max investi par période

**d) DCA Dynamique (momentum inverse)**
- On investit plus quand le marché baisse (ex : -10% → ×2 la mise), moins quand il monte
- Paramètres : mise de base, coefficient multiplicateur sur baisse, seuils de déclenchement

**e) Buy & Hold pur**
- Investissement initial + aucune action supplémentaire

**f) Rééquilibrage périodique**
- Portefeuille multi-actifs rééquilibré automatiquement à fréquence choisie
- Paramètres : allocation cible par actif, fréquence de rééquilibrage

**g) Stock Picking manuel**
- L'utilisateur saisit ses propres transactions (date, actif, quantité, prix) pour simuler un portefeuille réel
- Affichage de la performance réelle vs benchmark (ex: MSCI World)

**h) Momentum**
- On investit dans l'actif qui a le mieux performé sur les N derniers mois parmi une liste
- Paramètres : fenêtre de lookback (1, 3, 6, 12 mois), fréquence de rotation

#### Paramètres globaux
- Montant initial (apport de départ)
- Frais de courtage par transaction (montant fixe ou %)
- Frais de gestion annuels (pour AV, en %)
- Dividendes : réinvestis ou non
- Ajustement à l'inflation : oui / non (utiliser l'inflation française INSEE historique)
- Devise : EUR uniquement

#### Résultats affichés

**Métriques clés (cards en haut)** :
- Valeur finale du portefeuille
- Total investi
- Plus-value absolue (€) et relative (%)
- Performance annualisée (CAGR)
- Meilleure / pire année
- Ratio de Sharpe (simplifié, avec taux sans risque = Livret A)
- Max Drawdown (perte maximale depuis un pic)
- Volatilité annualisée

**Graphiques** :
- Courbe de valeur du portefeuille dans le temps (avec zone de confiance si Monte Carlo)
- Graphique en barres des performances annuelles
- Répartition du portefeuille (camembert)
- Comparaison avec un benchmark (MSCI World par défaut)
- Waterfall chart : montants investis vs gains

---

### 2. Comparateur d'enveloppes fiscales (PEA / CTO / Assurance-vie)

Simuler le même investissement dans les 3 enveloppes et afficher l'impact fiscal à la sortie.

**Fiscalité simulée (loi française en vigueur)** :
- **PEA** : exonération d'impôt sur les plus-values après 5 ans (hors prélèvements sociaux 17,2%)
- **CTO** : flat tax 30% (PFU) ou barème progressif simulé
- **Assurance-vie** : abattement 4 600€/an après 8 ans, prélèvements sociaux 17,2%, impôt 7,5% au-delà
- Afficher le montant net après impôt dans chaque enveloppe
- Afficher un tableau comparatif et un graphique barres côte à côte
- Ajouter une note pédagogique pour chaque enveloppe (encadré bleu clair)

---

### 3. Objectif Retraite

- Formulaire : âge actuel, âge de retraite souhaité, montant mensuel souhaité à la retraite, espérance de vie, rendement annuel estimé, inflation estimée
- Calculer : montant à investir par mois pour atteindre l'objectif
- Afficher un graphique de la trajectoire du capital dans le temps
- Indiquer si l'objectif est atteignable avec différents scénarios (pessimiste / neutre / optimiste)

---

### 4. Monte Carlo

- À partir des paramètres du simulateur principal, lancer N simulations (défaut : 1000) avec des rendements aléatoires basés sur la moyenne et volatilité historique de l'actif sélectionné
- Afficher : médiane, percentile 10%, percentile 90%, courbe en éventail
- Afficher la probabilité d'atteindre une valeur cible (saisie par l'utilisateur)
- Paramètre : nombre de simulations (100 à 5000)

---

### 5. Glossaire

- Page statique avec les définitions de : DCA, Value Averaging, PEA, CTO, Assurance-vie, ETF, CAGR, Max Drawdown, Ratio de Sharpe, Volatilité, Dividende, Rééquilibrage, Lump Sum, Momentum, Flat Tax, PFU, Prélèvements sociaux
- Format accordéon (FAQ)
- Optimisé SEO avec balisage schema.org FAQPage

---

## Monétisation

### Google AdSense
Prévoir dans le layout des **emplacements réservés** (divs avec classes `ad-slot`) aux positions suivantes :
- Bandeau horizontal 728×90 en haut de page (desktop) / 320×50 (mobile)
- Rectangle 300×250 dans la colonne de résultats (après les métriques)
- Bandeau interstitiel 728×90 en bas de page
- Sticky footer mobile 320×50

Commenter chaque emplacement avec `<!-- AdSense slot: POSITION_NAME -->` pour faciliter l'intégration future du code AdSense.

### Liens d'affiliation
Ajouter une section "Ouvrir un compte" visible sur la page comparateur d'enveloppes avec des boutons CTA vers :
- Fortuneo (PEA)
- Boursorama (PEA + CTO)
- Linxea (Assurance-vie)

Utiliser des `href="#affiliate-fortuneo"` en placeholder, avec commentaires `<!-- Remplacer par lien affilié Fortuneo -->`.

---

## Design & UX

- Design sobre, moderne, couleurs : bleu marine (#1e3a5f) + blanc + accents verts pour les gains / rouges pour les pertes
- Typographie : Inter (Google Fonts)
- Responsive mobile-first
- Mode sombre / clair (toggle)
- Tooltips explicatifs sur chaque métrique (icône ?)
- Chargement progressif (skeleton loaders pendant le fetch des données)
- Disclaimer légal en footer : "Ce site est à but éducatif uniquement et ne constitue pas un conseil en investissement."

---

## SEO

- Titre de page : "Simulateur de Portefeuille — PEA, CTO, Assurance-vie | Backtest gratuit"
- Meta description : "Simulez et backtestez vos stratégies d'investissement (DCA, Value Averaging, Lump Sum) sur PEA, CTO ou Assurance-vie. Outil gratuit pour particuliers français."
- Balises Open Graph pour partage réseaux sociaux
- Sitemap.xml généré
- robots.txt permissif

---

## Structure des fichiers attendue

```
/
├── index.html
├── vite.config.js
├── tailwind.config.js
├── package.json
├── public/
│   ├── robots.txt
│   └── sitemap.xml
└── src/
    ├── main.jsx
    ├── App.jsx
    ├── components/
    │   ├── layout/
    │   │   ├── Navbar.jsx
    │   │   ├── AdSlot.jsx
    │   │   └── Footer.jsx
    │   ├── simulator/
    │   │   ├── AssetSearch.jsx
    │   │   ├── StrategySelector.jsx
    │   │   ├── ParametersPanel.jsx
    │   │   ├── ResultsMetrics.jsx
    │   │   └── ResultsCharts.jsx
    │   ├── comparator/
    │   │   └── EnvelopeComparator.jsx
    │   ├── retirement/
    │   │   └── RetirementPlanner.jsx
    │   ├── montecarlo/
    │   │   └── MonteCarloSimulator.jsx
    │   └── glossary/
    │       └── Glossary.jsx
    ├── hooks/
    │   ├── useMarketData.js
    │   └── useSimulation.js
    ├── utils/
    │   ├── strategies.js       # Logique de chaque stratégie
    │   ├── fiscalite.js        # Calculs fiscaux FR
    │   ├── metrics.js          # CAGR, Sharpe, Drawdown, etc.
    │   └── montecarlo.js
    └── data/
        └── defaultAssets.js    # Actifs pré-chargés avec tickers
```

---

## Instructions finales pour Claude Code

1. Commence par installer les dépendances et configurer Vite + Tailwind + Recharts
2. Crée d'abord le layout global et la navigation
3. Implémente le simulateur principal en priorité (c'est la page clé)
4. Utilise des données mockées réalistes si l'API Yahoo Finance est indisponible (prévois un fallback avec données historiques S&P 500 hardcodées pour démo)
5. Chaque composant doit être fonctionnel de bout en bout avant de passer au suivant
6. Ajoute des commentaires en français dans le code pour faciliter la maintenance
7. Le site doit fonctionner en `npm run dev` immédiatement après installation
