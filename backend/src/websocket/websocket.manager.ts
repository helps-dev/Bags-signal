import { WebSocketServer, WebSocket } from 'ws';

interface ExtendedWebSocket extends WebSocket {
  isAlive: boolean;
  subscriptions: string[];
}

export class WebSocketManager {
  private wss: WebSocketServer;
  private clients: Set<ExtendedWebSocket> = new Set();

  constructor(wss: WebSocketServer) {
    this.wss = wss;
    this.initialize();
  }

  private initialize(): void {
    this.wss.on('connection', (ws: ExtendedWebSocket) => {
      console.log('New WebSocket connection established');
      
      ws.isAlive = true;
      ws.subscriptions = [];
      this.clients.add(ws);

      ws.on('pong', () => {
        ws.isAlive = true;
      });

      ws.on('message', (data: string) => {
        try {
          const message = JSON.parse(data);
          this.handleMessage(ws, message);
        } catch (error) {
          console.error('Invalid WebSocket message:', error);
        }
      });

      ws.on('close', () => {
        console.log('WebSocket connection closed');
        this.clients.delete(ws);
      });

      // Send initial connection success
      ws.send(JSON.stringify({
        type: 'connection',
        status: 'connected',
        timestamp: new Date().toISOString(),
      }));
    });

    // Heartbeat to keep connections alive
    setInterval(() => {
      this.clients.forEach((ws) => {
        if (!ws.isAlive) {
          ws.terminate();
          this.clients.delete(ws);
          return;
        }
        ws.isAlive = false;
        ws.ping();
      });
    }, 30000);
  }

  private handleMessage(ws: ExtendedWebSocket, message: any): void {
    switch (message.type) {
      case 'subscribe':
        if (message.channel && !ws.subscriptions.includes(message.channel)) {
          ws.subscriptions.push(message.channel);
          ws.send(JSON.stringify({
            type: 'subscribed',
            channel: message.channel,
          }));
        }
        break;

      case 'unsubscribe':
        if (message.channel) {
          ws.subscriptions = ws.subscriptions.filter(sub => sub !== message.channel);
          ws.send(JSON.stringify({
            type: 'unsubscribed',
            channel: message.channel,
          }));
        }
        break;

      default:
        ws.send(JSON.stringify({
          type: 'error',
          message: 'Unknown message type',
        }));
    }
  }

  // Broadcast to all subscribed clients
  broadcast(channel: string, data: any): void {
    const message = JSON.stringify({
      type: 'update',
      channel,
      data,
      timestamp: new Date().toISOString(),
    });

    this.clients.forEach((ws) => {
      if (ws.subscriptions.includes(channel) && ws.readyState === WebSocket.OPEN) {
        ws.send(message);
      }
    });
  }

  // Send to specific client
  sendToClient(ws: ExtendedWebSocket, data: any): void {
    if (ws.readyState === WebSocket.OPEN) {
      ws.send(JSON.stringify(data));
    }
  }
}
