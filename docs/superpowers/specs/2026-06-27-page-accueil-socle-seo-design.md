# Projet 1 — Page d'accueil + socle SEO

Date : 2026-06-27
Statut : approuvé, en implémentation

## Objectif

Poser la fondation qui débloque la monétisation du site (pubs + affiliation
courtiers) : passer d'une SPA à routing par ancre (`#simulateur`) à de **vraies
URLs indexables**, et créer une **page d'accueil éditoriale** distincte des
outils.

C'est le Projet 1 d'une série (Projets suivants : Guides/Blog, Page affiliation
courtiers, Capture email). Chaque projet = spec → plan → implémentation.

## Décisions cadrées

- **Approche technique** : on garde Vite + React. On ajoute **React Router**
  (vraies routes) + **pré-rendu statique** via `vite-react-ssg` (un HTML par
  page au build, 100 % statique, sans backend). Choix retenu pour son risque
  faible : les outils existants ne sont pas réécrits.
- **Monétisation** : pas encore de compte d'affiliation ni AdSense. On construit
  donc avec **emplacements pub + liens d'affiliation en placeholder**, centralisés
  et prêts à remplir.

## Architecture de routing

| URL            | Page                                   |
|----------------|----------------------------------------|
| `/`            | **Nouvelle page d'accueil** (landing)  |
| `/simulateur`  | Simulateur (existant, inchangé)        |
| `/comparateur` | Comparateur d'enveloppes (existant)    |
| `/retraite`    | Objectif retraite (existant)           |
| `/monte-carlo` | Monte Carlo (existant)                 |
| `/glossaire`   | Glossaire (existant)                   |

- L'état partagé (`config`, `updateConfig`, `marketData`, thème) remonte dans un
  **`RootLayout`** placé au-dessus des routes. Il persiste pendant la navigation
  client (comme aujourd'hui). Transmis aux pages via `useOutletContext`.
- Chaque page outil est un **wrapper mince** qui lit le contexte et le passe au
  composant existant (`Simulator`, `EnvelopeComparator`, …) — aucun composant
  outil n'est modifié dans sa logique.
- Anciennes ancres redirigées (`/#simulateur` → `/simulateur`) pour ne perdre
  aucun lien partagé.

## Pré-rendu statique (SEO)

- `vite-react-ssg` génère un fichier HTML par route au build, avec son `<title>`
  et `<meta description>` propres via le composant `<Head>`.
- `ssgOptions.mock = true` : un DOM jsdom est simulé au build pour que Recharts
  et tout accès incident à `window` ne plantent pas. Les `useEffect`
  (chargement des données de marché, schema FAQ) ne s'exécutent pas au build →
  les pages outils pré-rendent leur état initial puis s'hydratent côté client.
- `public/sitemap.xml` régénéré avec les 6 URLs réelles. `robots.txt` déjà OK.

## Page d'accueil `/` — structure

De haut en bas :
1. **Hero** — titre « Investir efficacement en France : PEA, CTO, Assurance-vie »
   + 2 CTA (« Simuler mon portefeuille » → `/simulateur`, « Comparer les
   enveloppes » → `/comparateur`).
2. **3 cartes d'orientation** PEA / CTO / Assurance-vie → `/comparateur`.
3. **Aperçu des outils** — 4 vignettes (Simulateur, Comparateur, Retraite,
   Monte Carlo).
4. **Bloc « Quel courtier choisir ? »** — mini-tableau 3 courtiers, boutons CTA
   *placeholder* d'affiliation (lus depuis `src/data/affiliates.js`).
5. **Bloc de contenu SEO** — 2-3 paragraphes rédactionnels indexables.
6. **Emplacements pub** (`AdSlot`, placeholder) intégrés proprement.

## Monétisation (placeholders prêts)

- `src/data/affiliates.js` : source unique des courtiers + liens d'affiliation
  (remplace les `#affiliate-*` éparpillés). À remplir une fois.
- `AdSlot` conservés en placeholder, prêts à activer.

## Hors périmètre (YAGNI — projets suivants)

Pas de blog/guides, pas d'email/lead magnet, pas de contenu d'articles, pas de
câblage réel des liens d'affiliation ni d'AdSense. Uniquement la fondation :
URLs réelles + page d'accueil + slots de monétisation prêts.

## Critères de succès

- `npm run build` produit `dist/index.html`, `dist/simulateur/index.html`, etc.,
  chacun avec un `<title>`/description propres dans le HTML source.
- Les 5 outils fonctionnent à l'identique après migration.
- La page d'accueil s'affiche sur `/` ; les anciennes ancres redirigent.
