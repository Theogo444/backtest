# Simulateur de Portefeuille — référentiel projet

## Stack
React 18 + Vite · **vite-react-ssg** (pré-rendu statique) + **react-router-dom** · TailwindCSS 3 · Recharts · lucide-react · tout côté client (pas de backend) · déployé sur Vercel. Build = `npm run build` (génère le sitemap puis pré-rend 1 HTML/route).

## Pages (vraies routes pré-rendues, table dans `src/routes.jsx`)
- `/` Accueil éditoriale · `/simulateur-debutant` simulateur guidé (courtier→enveloppe→actifs→plan, `BeginnerSimulator.jsx`) · `/simulateur` simulateur avancé (8 stratégies : Lump Sum, DCA, Value Averaging, DCA dynamique, Buy & Hold, Rééquilibrage, Stock Picking, Momentum ; CAGR/Sharpe/MaxDD/vol).
- `/comparateur` fiscal PEA/CTO/AV (`EnvelopeComparator.jsx`) · `/retraite` · `/monte-carlo` (100–5000 trajectoires) · `/glossaire` (`schema.org/FAQPage`).
- `/guides` + `/guides/:slug` — articles SEO. Ajouter un guide = déposer un `.js` dans `src/content/guides/` (collecté via `import.meta.glob`, rendu `marked`, schema Article).
- `/confidentialite` (RGPD ; identité éditeur en `[À COMPLÉTER]`).

## Routing / SEO (cf. mémoire `ssg-routing-architecture`)
- SEO par page via `<Head>` (title/description/canonical) — **pas** de title statique dans `index.html`.
- `manualChunks` désactivé au build SSR (`isSsrBuild`).
- **404 réel** : `NotFound.jsx` sur route `/404` (→ `dist/404.html`) + catch-all `*`. `vercel.json` SANS rewrite SPA → vrai HTTP 404. ⚠️ Ne pas réintroduire le rewrite.
- **Sitemap généré** au build : `scripts/generate-sitemap.mjs` (ne pas éditer `sitemap.xml` à la main).

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

## Monétisation & acquisition (tout en placeholder/mock à brancher)
- **Pas de publicité** : tous les emplacements AdSense (composant `AdSlot`, classe `.ad-slot`, script `index.html`) ont été **retirés** le 2026-06-29. Ne pas les réintroduire sans demande explicite.
- **Affiliation** : `href="#affiliate-*"` dans `src/data/affiliates.js` (CTA accueil/articles) et `src/data/brokers.js` (9 courtiers, frais INDICATIFS à vérifier).
- **Capture email** : `marketing/EmailCapture.jsx` (4 emplacements : home, sortie des 2 simulateurs, fin d'article) → `services/emailSignup.js` (**MOCK localStorage** ; brancher provider via Vercel Function `/api/subscribe`, bloc documenté).
- **Partage** : `marketing/ShareResult.jsx` (lien + copie + Web Share + export PNG `utils/shareCard.js`). État encodé LISIBLE dans l'URL via `utils/share.js`, restauré au montage. 
- **Analytics** : `utils/track.js` (no-op tant qu'aucun GA4/GTM/Plausible branché).

## Design
Bleu marine `#1e3a5f` · blanc · vert gains / rouge pertes · Inter · responsive mobile-first · mode sombre/clair.

## Fiscalité FR implémentée
- PEA : exonération PV après 5 ans (hors PS 17,2 %)
- CTO : flat tax 30 % (PFU) ou barème progressif
- AV : abattement 4 600 €/an après 8 ans, PS 17,2 %, impôt 7,5 % au-delà
