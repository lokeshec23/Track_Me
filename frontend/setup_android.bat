@echo off
echo Installing Capacitor dependencies...
call npm install @capacitor/core @capacitor/cli @capacitor/android

echo Initializing Capacitor...
call npx cap init "Track Me" "com.trackme.app" --web-dir dist

echo Adding Android platform...
call npx cap add android

echo Building web assets...
call npm run build

echo Syncing with Capacitor...
call npx cap sync

echo Setup complete! You can now run "npx cap open android" to open Android Studio.
pause
