#!/bin/bash
# Dev server with auto-restart
LOGFILE="/home/z/my-project/dev.log"
cd /home/z/my-project

while true; do
  echo "[$(date)] Starting dev server..." >> "$LOGFILE"
  NODE_OPTIONS='--max-old-space-size=256' npx next dev -p 3000 >> "$LOGFILE" 2>&1
  EXIT_CODE=$?
  echo "[$(date)] Dev server exited with code $EXIT_CODE, restarting in 3s..." >> "$LOGFILE"
  sleep 3
done
