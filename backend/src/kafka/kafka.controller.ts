import { Controller, Post, Body } from '@nestjs/common';
import { EventPattern, MessagePattern } from '@nestjs/microservices';
import { ApiTags, ApiOperation } from '@nestjs/swagger';
import { KafkaService, ComplaintEvent, NotificationEvent, UserEvent } from './kafka.service';
import { WebSocketGateway } from '../websocket/websocket.gateway';

@ApiTags('Kafka Events')
@Controller('kafka')
export class KafkaController {
  constructor(
    private readonly kafkaService: KafkaService,
    private readonly webSocketGateway: WebSocketGateway,
  ) {}

  // Event handlers for incoming Kafka messages
  @EventPattern('complaint.created')
  async handleComplaintCreated(data: ComplaintEvent) {
    console.log('📥 Received complaint.created event:', data.id);
    
    // Broadcast to all connected frontend clients
    this.webSocketGateway.broadcastEvent('complaint.created', {
      type: 'complaint.created',
      data: data,
      timestamp: new Date().toISOString(),
    });
  }

  @EventPattern('complaint.updated')
  async handleComplaintUpdated(data: ComplaintEvent) {
    console.log('📥 Received complaint.updated event:', data.id);
    
    // Broadcast to all connected frontend clients
    this.webSocketGateway.broadcastEvent('complaint.updated', {
      type: 'complaint.updated',
      data: data,
      timestamp: new Date().toISOString(),
    });
  }

  @EventPattern('complaint.deleted')
  async handleComplaintDeleted(data: { id: string; userId: string; deletedAt: string }) {
    console.log('📥 Received complaint.deleted event:', data.id);
    
    // Broadcast to all connected frontend clients
    this.webSocketGateway.broadcastEvent('complaint.deleted', {
      type: 'complaint.deleted',
      data: data,
      timestamp: new Date().toISOString(),
    });
  }

  @EventPattern('user.created')
  async handleUserCreated(data: UserEvent) {
    console.log('📥 Received user.created event:', data.id);
    // Handle user creation events
  }

  @EventPattern('user.updated')
  async handleUserUpdated(data: UserEvent) {
    console.log('📥 Received user.updated event:', data.id);
    // Handle user update events
  }

  @EventPattern('notification.created')
  async handleNotificationCreated(data: NotificationEvent) {
    console.log('📥 Received notification.created event for user:', data.userId);
    // Handle notification creation events
  }

  // Message handlers for request-response patterns
  @MessagePattern('get.complaint.stats')
  async handleGetComplaintStats() {
    console.log('📥 Received get.complaint.stats request');
    // Return complaint statistics
    return {
      total: 0,
      pending: 0,
      inProgress: 0,
      resolved: 0,
    };
  }

  @MessagePattern('get.user.stats')
  async handleGetUserStats() {
    console.log('📥 Received get.user.stats request');
    // Return user statistics
    return {
      total: 0,
      active: 0,
      inactive: 0,
    };
  }

  // Manual event publishing endpoints for testing
  @Post('publish/complaint-created')
  @ApiOperation({ summary: 'Publish complaint created event' })
  async publishComplaintCreated(@Body() event: ComplaintEvent) {
    await this.kafkaService.publishComplaintCreated(event);
    return { message: 'Complaint created event published successfully' };
  }

  @Post('publish/notification-created')
  @ApiOperation({ summary: 'Publish notification created event' })
  async publishNotificationCreated(@Body() event: NotificationEvent) {
    await this.kafkaService.publishNotificationCreated(event);
    return { message: 'Notification created event published successfully' };
  }

  @Post('publish/user-created')
  @ApiOperation({ summary: 'Publish user created event' })
  async publishUserCreated(@Body() event: UserEvent) {
    await this.kafkaService.publishUserCreated(event);
    return { message: 'User created event published successfully' };
  }
}
