#!/bin/bash
set -e
git pull
cd Server
npm install
npm run build
pm2 reload CyberpunkMap
