import { Injectable, Inject, OnModuleInit, OnModuleDestroy } from '@nestjs/common';
import { ClientKafka } from '@nestjs/microservices';
import { ConfigService } from '@nestjs/config';

export interface ComplaintEvent {
  id: string;
  title: string;
  description: string;
  category: string;
  priority: string;
  status: string;
  userId: string;
  apartment: string;
  building: string;
  createdAt: string;
  updatedAt: string;
}

export interface NotificationEvent {
  userId: string;
  title: string;
  message: string;
  type: string;
  complaintId?: string;
}

export interface UserEvent {
  id: string;
  email: string;
  role: string;
  isActive: boolean;
  createdAt: string;
}

@Injectable()
export class KafkaService implements OnModuleInit, OnModuleDestroy {
  private isConnected = false;

  constructor(
    @Inject('KAFKA_SERVICE') private kafkaClient: ClientKafka | null,
    private configService: ConfigService,
  ) {}

  async onModuleInit() {
    const kafkaBroker = this.configService.get('KAFKA_BROKER');
    
    if (!kafkaBroker || !this.kafkaClient) {
      console.log('ℹ️ No Kafka broker configured or client not available, skipping Kafka initialization');
      return;
    }

    try {
      // Subscribe to topics
      const topics = [
        'complaint.created',
        'complaint.updated',
        'complaint.deleted',
        'user.created',
        'user.updated',
        'notification.created',
      ];

      topics.forEach(topic => {
        this.kafkaClient.subscribeToResponseOf(topic);
      });

      await this.kafkaClient.connect();
      this.isConnected = true;
      console.log('✅ Kafka Client Connected');
    } catch (error) {
      console.warn('⚠️ Kafka connection failed (continuing without Kafka):', error.message);
      this.isConnected = false;
    }
  }

  async onModuleDestroy() {
    if (this.isConnected && this.kafkaClient) {
      try {
        await this.kafkaClient.close();
      } catch (error) {
        console.warn('⚠️ Error closing Kafka connection:', error.message);
      }
    }
  }

  // Complaint Events
  async publishComplaintCreated(event: ComplaintEvent): Promise<void> {
    if (!this.isConnected || !this.kafkaClient) {
      console.log('ℹ️ Kafka not connected, skipping complaint.created event');
      return;
    }
    try {
      await this.kafkaClient.emit('complaint.created', event);
      console.log('📤 Published complaint.created event:', event.id);
    } catch (error) {
      console.warn('⚠️ Failed to publish complaint.created event:', error.message);
    }
  }

  async publishComplaintUpdated(event: ComplaintEvent): Promise<void> {
    if (!this.isConnected || !this.kafkaClient) {
      console.log('ℹ️ Kafka not connected, skipping complaint.updated event');
      return;
    }
    try {
      await this.kafkaClient.emit('complaint.updated', event);
      console.log('📤 Published complaint.updated event:', event.id);
    } catch (error) {
      console.warn('⚠️ Failed to publish complaint.updated event:', error.message);
    }
  }

  async publishComplaintDeleted(complaintId: string, userId: string): Promise<void> {
    if (!this.isConnected || !this.kafkaClient) {
      console.log('ℹ️ Kafka not connected, skipping complaint.deleted event');
      return;
    }
    try {
      const event = {
        id: complaintId,
        userId,
        deletedAt: new Date().toISOString(),
      };
      await this.kafkaClient.emit('complaint.deleted', event);
      console.log('📤 Published complaint.deleted event:', complaintId);
    } catch (error) {
      console.warn('⚠️ Failed to publish complaint.deleted event:', error.message);
    }
  }

  // User Events
  async publishUserCreated(event: UserEvent): Promise<void> {
    if (!this.isConnected || !this.kafkaClient) {
      console.log('ℹ️ Kafka not connected, skipping user.created event');
      return;
    }
    try {
      await this.kafkaClient.emit('user.created', event);
      console.log('📤 Published user.created event:', event.id);
    } catch (error) {
      console.warn('⚠️ Failed to publish user.created event:', error.message);
    }
  }

  async publishUserUpdated(event: UserEvent): Promise<void> {
    if (!this.isConnected || !this.kafkaClient) {
      console.log('ℹ️ Kafka not connected, skipping user.updated event');
      return;
    }
    try {
      await this.kafkaClient.emit('user.updated', event);
      console.log('📤 Published user.updated event:', event.id);
    } catch (error) {
      console.warn('⚠️ Failed to publish user.updated event:', error.message);
    }
  }

  // Notification Events
  async publishNotificationCreated(event: NotificationEvent): Promise<void> {
    if (!this.isConnected || !this.kafkaClient) {
      console.log('ℹ️ Kafka not connected, skipping notification.created event');
      return;
    }
    try {
      await this.kafkaClient.emit('notification.created', event);
      console.log('📤 Published notification.created event for user:', event.userId);
    } catch (error) {
      console.warn('⚠️ Failed to publish notification.created event:', error.message);
    }
  }

  // Generic event publishing
  async publishEvent(topic: string, data: any): Promise<void> {
    if (!this.isConnected || !this.kafkaClient) {
      console.log(`ℹ️ Kafka not connected, skipping ${topic} event`);
      return;
    }
    try {
      await this.kafkaClient.emit(topic, data);
      console.log(`📤 Published ${topic} event:`, data);
    } catch (error) {
      console.warn(`⚠️ Failed to publish ${topic} event:`, error.message);
    }
  }

  // Send message and wait for response
  async sendMessage<T>(topic: string, data: any): Promise<T> {
    if (!this.isConnected || !this.kafkaClient) {
      throw new Error('Kafka not connected');
    }
    try {
      return await this.kafkaClient.send(topic, data).toPromise();
    } catch (error) {
      console.warn(`⚠️ Failed to send message to ${topic}:`, error.message);
      throw error;
    }
  }
}
