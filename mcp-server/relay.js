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
    try {
      const message = data.toString();
      console.log('Received:', message.substring(0, 100) + (message.length > 100 ? '...' : ''));

      // Validate that it's valid JSON
      try {
        JSON.parse(message);
      } catch (parseError) {
        console.error('Invalid JSON received:', parseError.message);
        // Send error back to sender
        if (ws.readyState === WebSocket.OPEN) {
          ws.send(JSON.stringify({
            type: 'error',
            payload: 'Invalid JSON format',
            error: parseError.message
          }));
        }
        return;
      }

      // Broadcast to all other clients
      clients.forEach(client => {
        if (client !== ws && client.readyState === WebSocket.OPEN) {
          try {
            client.send(message);
          } catch (sendError) {
            console.error('Error sending to client:', sendError.message);
          }
        }
      });
    } catch (error) {
      console.error('Error handling message:', error.message);
    }
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
