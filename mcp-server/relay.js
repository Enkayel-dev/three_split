/**
 * WebSocket relay server for MCP <-> React app communication
 * Run with: node relay.js
 */

import { WebSocketServer, WebSocket } from 'ws';

const PORT = 3001;
const wss = new WebSocketServer({ port: PORT });

let clients = [];

wss.on('connection', (ws) => {
  clients.push(ws);
  console.log(`Client connected. Total clients: ${clients.length}`);

  ws.on('message', (data) => {
    const message = data.toString();
    console.log('Received:', message.substring(0, 100) + (message.length > 100 ? '...' : ''));

    // Broadcast to all other clients
    clients.forEach(client => {
      if (client !== ws && client.readyState === WebSocket.OPEN) {
        client.send(message);
      }
    });
  });

  ws.on('close', () => {
    clients = clients.filter(c => c !== ws);
    console.log(`Client disconnected. Total clients: ${clients.length}`);
  });

  ws.on('error', (error) => {
    console.error('WebSocket error:', error.message);
  });
});

console.log(`WebSocket relay server running on ws://localhost:${PORT}`);
console.log('Waiting for connections from React app and MCP server...');
