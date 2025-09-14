import { Module } from '@nestjs/common';
import { ClientsModule, Transport } from '@nestjs/microservices';
import { ConfigModule, ConfigService } from '@nestjs/config';
import { KafkaService } from './kafka.service';
import { KafkaController } from './kafka.controller';
import { WebSocketModule } from '../websocket/websocket.module';

@Module({
  imports: [
    WebSocketModule,
    ClientsModule.registerAsync([
      {
        name: 'KAFKA_SERVICE',
        imports: [ConfigModule],
        useFactory: async (configService: ConfigService) => {
          const kafkaBroker = configService.get('KAFKA_BROKER');
          
          if (!kafkaBroker) {
            console.log('ℹ️ No Kafka broker configured, skipping Kafka client registration');
            return null;
          }

          return {
            transport: Transport.KAFKA,
            options: {
              client: {
                clientId: 'resident-management-service',
                brokers: [kafkaBroker],
                connectionTimeout: 5000,
                requestTimeout: 5000,
                retry: {
                  initialRetryTime: 100,
                  retries: 3,
                },
              },
              consumer: {
                groupId: 'resident-management-group',
              },
            },
          };
        },
        inject: [ConfigService],
      },
    ]),
  ],
  providers: [KafkaService],
  controllers: [KafkaController],
  exports: [KafkaService],
})
export class KafkaModule {}
