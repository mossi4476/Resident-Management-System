import {
  WebSocketGateway as WSGateway,
  WebSocketServer,
  SubscribeMessage,
  OnGatewayConnection,
  OnGatewayDisconnect,
  MessageBody,
  ConnectedSocket,
} from '@nestjs/websockets';
import { Server, Socket } from 'socket.io';
import { Injectable } from '@nestjs/common';

@Injectable()
@WSGateway({
  cors: {
    origin: ['http://localhost:3000', 'http://localhost:3002'],
    credentials: true,
  },
})
export class WebSocketGateway implements OnGatewayConnection, OnGatewayDisconnect {
  @WebSocketServer()
  server: Server;

  private connectedClients = new Map<string, Socket>();

  handleConnection(client: Socket) {
    console.log(`🔌 Client connected: ${client.id}`);
    console.log(`🔌 Total connected clients: ${this.connectedClients.size + 1}`);
    this.connectedClients.set(client.id, client);
  }

  handleDisconnect(client: Socket) {
    console.log(`🔌 Client disconnected: ${client.id}`);
    this.connectedClients.delete(client.id);
    console.log(`🔌 Total connected clients: ${this.connectedClients.size}`);
  }

  @SubscribeMessage('join-room')
  handleJoinRoom(
    @ConnectedSocket() client: Socket,
    @MessageBody() data: { room: string },
  ) {
    client.join(data.room);
    console.log(`👤 Client ${client.id} joined room: ${data.room}`);
    return { message: `Joined room: ${data.room}` };
  }

  @SubscribeMessage('leave-room')
  handleLeaveRoom(
    @ConnectedSocket() client: Socket,
    @MessageBody() data: { room: string },
  ) {
    client.leave(data.room);
    console.log(`👤 Client ${client.id} left room: ${data.room}`);
    return { message: `Left room: ${data.room}` };
  }

  // Method to broadcast events to all connected clients
  broadcastEvent(eventType: string, data: any) {
    this.server.emit(eventType, data);
    console.log(`📡 Broadcasted ${eventType} event to all clients`);
  }

  // Method to broadcast to specific room
  broadcastToRoom(room: string, eventType: string, data: any) {
    this.server.to(room).emit(eventType, data);
    console.log(`📡 Broadcasted ${eventType} event to room: ${room}`);
  }

  // Method to send to specific client
  sendToClient(clientId: string, eventType: string, data: any) {
    const client = this.connectedClients.get(clientId);
    if (client) {
      client.emit(eventType, data);
      console.log(`📡 Sent ${eventType} event to client: ${clientId}`);
    }
  }
}
