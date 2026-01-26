@echo off
echo Building the PWA...
call npm run build

echo Starting PWA server...
echo ---------------------------------------------------
echo On your mobile phone, connect to the same Wi-Fi.
echo Then open one of the "Network" URLs shown below.
echo ---------------------------------------------------
call npm run preview -- --host
pause
