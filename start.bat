@echo off
title Three Split - Development Servers
color 0A

echo.
echo ========================================
echo   Three Split Development Launcher
echo ========================================
echo.
echo Starting servers...
echo.

REM Start the WebSocket relay server in a new minimized window
echo [1/2] Starting WebSocket Relay Server (port 3001)...
start /min "Relay Server" cmd /k "cd mcp-server && node relay.js"

REM Wait a second for relay to start
timeout /t 2 /nobreak >nul

REM Start the React dev server in the current window
echo [2/2] Starting React App (port 5173)...
echo.
echo ========================================
echo   READY!
echo ========================================
echo   App: http://localhost:5173
echo   Relay: ws://localhost:3001
echo.
echo   Both servers are running.
echo   Close this window to stop both.
echo ========================================
echo.

npm run dev
