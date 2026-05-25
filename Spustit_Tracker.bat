@echo off
title Spousteni UGC Trackeru
cd ugc-tracker
echo Spoustim server...
start http://localhost:5173
npm run dev -- --port 5173
pause
