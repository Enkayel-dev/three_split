@echo off
REM Three Split MCP Server Startup Script (Windows)
REM This script starts all necessary servers in the correct order

setlocal enabledelayedexpansion

echo.
echo ============================================================
echo   Three Split MCP Server - Startup
echo ============================================================
echo.

REM Check if we're in the right directory
if not exist "package.json" (
    echo [ERROR] Must be run from the three_split project root directory
    exit /b 1
)

if not exist "mcp-server" (
    echo [ERROR] mcp-server directory not found
    exit /b 1
)

echo [OK] Found project root
echo.

REM Check for Node.js
where node >nul 2>nul
if %ERRORLEVEL% NEQ 0 (
    echo [ERROR] Node.js is not installed. Please install Node.js first.
    exit /b 1
)

for /f "tokens=*" %%i in ('node --version') do set NODE_VERSION=%%i
echo [OK] Node.js found: %NODE_VERSION%

REM Check for npm
where npm >nul 2>nul
if %ERRORLEVEL% NEQ 0 (
    echo [ERROR] npm is not installed. Please install npm first.
    exit /b 1
)

for /f "tokens=*" %%i in ('npm --version') do set NPM_VERSION=%%i
echo [OK] npm found: %NPM_VERSION%
echo.

REM Check if dependencies are installed
echo [INFO] Checking dependencies...

if not exist "node_modules" (
    echo [WARN] React app dependencies not found. Installing...
    call npm install
    if %ERRORLEVEL% NEQ 0 (
        echo [ERROR] Failed to install React app dependencies
        exit /b 1
    )
    echo [OK] React app dependencies installed
) else (
    echo [OK] React app dependencies found
)

if not exist "mcp-server\node_modules" (
    echo [WARN] MCP server dependencies not found. Installing...
    cd mcp-server
    call npm install
    if %ERRORLEVEL% NEQ 0 (
        echo [ERROR] Failed to install MCP server dependencies
        cd ..
        exit /b 1
    )
    cd ..
    echo [OK] MCP server dependencies installed
) else (
    echo [OK] MCP server dependencies found
)

echo.
echo [INFO] Building MCP server...
cd mcp-server
call npm run build
if %ERRORLEVEL% NEQ 0 (
    echo [ERROR] Failed to build MCP server
    cd ..
    exit /b 1
)
cd ..
echo [OK] MCP server built successfully
echo.

REM Create logs directory if it doesn't exist
if not exist "logs" (
    mkdir logs
)

REM Kill any existing processes on our ports
echo [INFO] Checking for existing processes...

for /f "tokens=5" %%a in ('netstat -aon ^| find ":3001" ^| find "LISTENING"') do (
    echo [WARN] Killing existing process on port 3001 (PID: %%a)
    taskkill /PID %%a /F >nul 2>&1
)

for /f "tokens=5" %%a in ('netstat -aon ^| find ":5173" ^| find "LISTENING"') do (
    echo [WARN] Killing existing process on port 5173 (PID: %%a)
    taskkill /PID %%a /F >nul 2>&1
)

echo [OK] Ports are ready
echo.

REM Start Relay Server
echo [INFO] Starting Relay Server (Port 3001)...
cd mcp-server
start "Three Split Relay Server" /MIN cmd /c "node relay.js > ..\logs\relay.log 2>&1"
cd ..
timeout /t 2 /nobreak >nul
echo [OK] Relay Server started
echo.

REM Start MCP Server
echo [INFO] Starting MCP Server...
cd mcp-server
start "Three Split MCP Server" /MIN cmd /c "npm start > ..\logs\mcp.log 2>&1"
cd ..
timeout /t 2 /nobreak >nul
echo [OK] MCP Server started
echo.

REM Start React Dev Server
echo [INFO] Starting React Dev Server (Port 5173)...
start "Three Split React App" /MIN cmd /c "npm run dev > logs\react.log 2>&1"
timeout /t 3 /nobreak >nul
echo [OK] React Dev Server started
echo.

echo ============================================================
echo   All servers are running!
echo ============================================================
echo.
echo [OK] Relay Server:      ws://localhost:3001
echo [OK] MCP Server:        stdio
echo [OK] React App:         http://localhost:5173
echo.
echo ============================================================
echo.
echo [INFO] Next steps:
echo   1. Open your browser to http://localhost:5173
echo   2. Start Claude Desktop manually
echo   3. Claude Desktop will connect to the MCP server automatically
echo.
echo [INFO] Logs are available in the 'logs' directory:
echo   - logs\relay.log
echo   - logs\mcp.log
echo   - logs\react.log
echo.
echo [INFO] Check the minimized windows in your taskbar to see server output
echo.
echo [WARN] To stop all servers:
echo   - Close this window and the 3 minimized server windows
echo   - Or use Task Manager to kill the Node.js processes
echo.

REM Keep window open
pause
