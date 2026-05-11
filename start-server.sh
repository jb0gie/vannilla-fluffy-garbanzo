#!/bin/bash
nohup npx http-server ./ --port 8080 -c-1 --no-dotfiles --no-cors --no-logs > /dev/null 2>&1 &
echo "Server started at http://127.0.0.1:8080 with caching disabled"