import { io, Socket } from 'socket.io-client';

class WebSocketService {
  private socket: Socket | null = null;
  private eventHandlers: Map<string, Function[]> = new Map();

  connect() {
    if (this.socket?.connected) {
      console.log('🔌 WebSocket already connected');
      return;
    }

    console.log('🔌 Attempting to connect to WebSocket server...');
    this.socket = io('http://localhost:3001', {
      transports: ['websocket'],
    });

    this.socket.on('connect', () => {
      console.log('🔌 Connected to WebSocket server');
    });

    this.socket.on('disconnect', () => {
      console.log('🔌 Disconnected from WebSocket server');
    });

    // Listen for Kafka events
    this.socket.on('complaint.created', (data) => {
      console.log('📥 Received complaint.created event:', data);
      this.emit('complaint.created', data);
    });

    this.socket.on('complaint.updated', (data) => {
      console.log('📥 Received complaint.updated event:', data);
      this.emit('complaint.updated', data);
    });

    this.socket.on('complaint.deleted', (data) => {
      console.log('📥 Received complaint.deleted event:', data);
      this.emit('complaint.deleted', data);
    });
  }

  disconnect() {
    if (this.socket) {
      this.socket.disconnect();
      this.socket = null;
    }
  }

  // Subscribe to events
  on(event: string, handler: Function) {
    if (!this.eventHandlers.has(event)) {
      this.eventHandlers.set(event, []);
    }
    this.eventHandlers.get(event)!.push(handler);
  }

  // Unsubscribe from events
  off(event: string, handler: Function) {
    const handlers = this.eventHandlers.get(event);
    if (handlers) {
      const index = handlers.indexOf(handler);
      if (index > -1) {
        handlers.splice(index, 1);
      }
    }
  }

  // Emit events to subscribers
  private emit(event: string, data: any) {
    const handlers = this.eventHandlers.get(event);
    if (handlers) {
      handlers.forEach(handler => handler(data));
    }
  }

  // Join a room
  joinRoom(room: string) {
    if (this.socket) {
      this.socket.emit('join-room', { room });
    }
  }

  // Leave a room
  leaveRoom(room: string) {
    if (this.socket) {
      this.socket.emit('leave-room', { room });
    }
  }

  isConnected() {
    const connected = this.socket?.connected || false;
    console.log('🔌 WebSocket isConnected:', connected);
    return connected;
  }
}

export const webSocketService = new WebSocketService();
