#!/bin/bash
# Post PM update to #team_platforms_pm
# Run from project root: ./scripts/post-pm-update.sh
# Or: bash scripts/post-pm-update.sh

SCRIPT_DIR="$(cd "$(dirname "$0")" && pwd)"
cd "$SCRIPT_DIR/pm-update-scheduled" || { echo "No such directory: $SCRIPT_DIR/pm-update-scheduled"; exit 1; }
node post-trial-update.js
