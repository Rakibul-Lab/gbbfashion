#!/bin/bash
cd /home/z/my-project
export NODE_OPTIONS='--max-old-space-size=512'
exec node /home/z/my-project/node_modules/.bin/next dev -p 3000
