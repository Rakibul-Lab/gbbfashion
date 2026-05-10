#!/bin/bash
cd /home/z/my-project
while true; do
  NODE_ENV=production node .next/standalone/server.js 2>&1
  sleep 2
done
