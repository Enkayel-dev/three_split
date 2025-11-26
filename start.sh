#!/bin/bash

# Three Split MCP Server Startup Script
# This script starts all necessary servers in the correct order

set -e  # Exit on error

# Colors for output
RED='\033[0;31m'
GREEN='\033[0;32m'
YELLOW='\033[1;33m'
BLUE='\033[0;34m'
NC='\033[0m' # No Color

# Function to print colored output
print_info() {
    echo -e "${BLUE}ℹ${NC} $1"
}

print_success() {
    echo -e "${GREEN}✓${NC} $1"
}

print_error() {
    echo -e "${RED}✗${NC} $1"
}

print_warning() {
    echo -e "${YELLOW}⚠${NC} $1"
}

# Function to check if a port is in use
check_port() {
    local port=$1
    if lsof -Pi :$port -sTCP:LISTEN -t >/dev/null 2>&1 ; then
        return 0  # Port is in use
    else
        return 1  # Port is free
    fi
}

# Function to kill process on port
kill_port() {
    local port=$1
    print_warning "Killing existing process on port $port..."
    lsof -ti:$port | xargs kill -9 2>/dev/null || true
}

# Store PIDs for cleanup
RELAY_PID=""
MCP_PID=""
REACT_PID=""

# Cleanup function
cleanup() {
    print_info "Shutting down servers..."

    if [ ! -z "$REACT_PID" ]; then
        print_info "Stopping React dev server (PID: $REACT_PID)..."
        kill $REACT_PID 2>/dev/null || true
    fi

    if [ ! -z "$MCP_PID" ]; then
        print_info "Stopping MCP server (PID: $MCP_PID)..."
        kill $MCP_PID 2>/dev/null || true
    fi

    if [ ! -z "$RELAY_PID" ]; then
        print_info "Stopping Relay server (PID: $RELAY_PID)..."
        kill $RELAY_PID 2>/dev/null || true
    fi

    print_success "All servers stopped."
    exit 0
}

# Register cleanup on script exit
trap cleanup EXIT INT TERM

# Print banner
echo ""
echo "━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━"
echo "  Three Split MCP Server - Startup"
echo "━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━"
echo ""

# Check if we're in the right directory
if [ ! -f "package.json" ] || [ ! -d "mcp-server" ]; then
    print_error "Must be run from the three_split project root directory"
    exit 1
fi

print_success "Found project root"

# Check for Node.js
if ! command -v node &> /dev/null; then
    print_error "Node.js is not installed. Please install Node.js first."
    exit 1
fi

print_success "Node.js found: $(node --version)"

# Check for npm
if ! command -v npm &> /dev/null; then
    print_error "npm is not installed. Please install npm first."
    exit 1
fi

print_success "npm found: $(npm --version)"
echo ""

# Check if dependencies are installed
print_info "Checking dependencies..."

if [ ! -d "node_modules" ]; then
    print_warning "React app dependencies not found. Installing..."
    npm install
    print_success "React app dependencies installed"
else
    print_success "React app dependencies found"
fi

if [ ! -d "mcp-server/node_modules" ]; then
    print_warning "MCP server dependencies not found. Installing..."
    cd mcp-server && npm install && cd ..
    print_success "MCP server dependencies installed"
else
    print_success "MCP server dependencies found"
fi

echo ""
print_info "Building MCP server..."
cd mcp-server && npm run build && cd ..
print_success "MCP server built successfully"
echo ""

# Check and clean up ports
print_info "Checking ports..."

if check_port 3001; then
    print_warning "Port 3001 (Relay Server) is already in use"
    kill_port 3001
    sleep 1
fi

if check_port 5173; then
    print_warning "Port 5173 (React Dev Server) is already in use"
    kill_port 5173
    sleep 1
fi

print_success "Ports are ready"
echo ""

# Start Relay Server
print_info "Starting Relay Server (Port 3001)..."
cd mcp-server
node relay.js > ../logs/relay.log 2>&1 &
RELAY_PID=$!
cd ..

# Wait for relay to be ready
sleep 2

if ps -p $RELAY_PID > /dev/null; then
    print_success "Relay Server started (PID: $RELAY_PID)"
else
    print_error "Failed to start Relay Server"
    cat logs/relay.log
    exit 1
fi

echo ""

# Start MCP Server
print_info "Starting MCP Server..."
cd mcp-server
npm start > ../logs/mcp.log 2>&1 &
MCP_PID=$!
cd ..

# Wait for MCP server to be ready
sleep 2

if ps -p $MCP_PID > /dev/null; then
    print_success "MCP Server started (PID: $MCP_PID)"
else
    print_error "Failed to start MCP Server"
    cat logs/mcp.log
    exit 1
fi

echo ""

# Start React Dev Server
print_info "Starting React Dev Server (Port 5173)..."
npm run dev > logs/react.log 2>&1 &
REACT_PID=$!

# Wait for React to be ready
sleep 3

if ps -p $REACT_PID > /dev/null; then
    print_success "React Dev Server started (PID: $REACT_PID)"
else
    print_error "Failed to start React Dev Server"
    cat logs/react.log
    exit 1
fi

echo ""
echo "━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━"
echo -e "  ${GREEN}All servers are running!${NC}"
echo "━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━"
echo ""
print_success "Relay Server:      ws://localhost:3001 (PID: $RELAY_PID)"
print_success "MCP Server:        stdio (PID: $MCP_PID)"
print_success "React App:         http://localhost:5173 (PID: $REACT_PID)"
echo ""
echo "━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━"
echo ""
print_info "Next steps:"
echo "  1. Open your browser to http://localhost:5173"
echo "  2. Start Claude Desktop manually"
echo "  3. Claude Desktop will connect to the MCP server automatically"
echo ""
print_info "Logs are available in the 'logs' directory:"
echo "  - logs/relay.log"
echo "  - logs/mcp.log"
echo "  - logs/react.log"
echo ""
print_warning "Press Ctrl+C to stop all servers"
echo ""

# Wait for user interrupt
wait
