#!/bin/bash
# ============================================================================
#  daily-refresh.sh
#  Rafraîchit l'historique réel des cours (yfinance) puis committe/pousse si
#  changé. Lancé chaque jour par launchd sur le Mac (IP « propre », non bloquée
#  par Yahoo — contrairement aux IP datacenter de GitHub Actions).
#
#  Agent : ~/Library/LaunchAgents/com.backtest.daily-refresh.plist
#  Logs  : ~/Library/Logs/backtest-refresh.log
#
#  N'agit que sur public/data/history.json (ne touche pas au reste du dépôt).
# ============================================================================
set -u
export PATH="/usr/local/bin:/usr/bin:/bin:/usr/sbin:/sbin"

REPO="/Users/theoeg/Desktop/Claude/backtest"
PY="/Library/Frameworks/Python.framework/Versions/3.13/bin/python3"

cd "$REPO" || { echo "repo introuvable"; exit 1; }
echo "===== $(date '+%Y-%m-%d %H:%M:%S') ====="

# 1) Récupère l'historique mensuel réel (jusqu'au mois en cours) des 56 actifs.
"$PY" scripts/fetch-history.py 2>&1 | grep -E "actifs écrits|Aucune|indisponible|ERREUR" | tail -5
if [ ! -f public/data/history.json ]; then
  echo "history.json absent — abandon."
  exit 1
fi

# 2) Rien à pousser si le fichier n'a pas changé.
if git diff --quiet -- public/data/history.json; then
  echo "Aucun changement de cours — pas de commit."
  exit 0
fi

# 3) Commit + push (path-limité : ne committe que history.json).
git pull --rebase --autostash origin master 2>&1 | tail -2
git add public/data/history.json
git commit -m "chore: refresh quotidien de l'historique ($(date +%F))" -- public/data/history.json 2>&1 | tail -2
git push origin master 2>&1 | tail -2
echo "Refresh poussé."
