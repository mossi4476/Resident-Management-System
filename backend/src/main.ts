import { NestFactory } from '@nestjs/core';
import { ValidationPipe } from '@nestjs/common';
import { SwaggerModule, DocumentBuilder } from '@nestjs/swagger';
import { AppModule } from './app.module';
import helmet from 'helmet';

async function bootstrap() {
  // Set default Redis URL for local development if not provided
  if (!process.env.REDIS_URL && process.env.NODE_ENV !== 'production') {
    process.env.REDIS_URL = 'redis://localhost:6379';
  }
  
  // Set default Kafka broker for local development if not provided
  if (!process.env.KAFKA_BROKER && process.env.NODE_ENV !== 'production') {
    process.env.KAFKA_BROKER = 'localhost:9092';
  }
  
  // For development without Docker, disable Redis and Kafka temporarily
  if (process.env.NODE_ENV === 'development') {
    console.log('🔧 Development mode: Redis and Kafka will be optional');
  }
  
  const app = await NestFactory.create(AppModule);

  // Security middleware
  app.use(helmet());
  app.enableCors({
    origin: [
      'http://localhost:3000',  // Frontend port
      'http://localhost:3002',  // Alternative frontend port
      process.env.FRONTEND_URL || 'http://localhost:3000'
    ],
    credentials: true,
  });

  // Global validation pipe
  app.useGlobalPipes(
    new ValidationPipe({
      whitelist: true,
      forbidNonWhitelisted: true,
      transform: true,
    }),
  );

  // Swagger documentation
  const config = new DocumentBuilder()
    .setTitle('Resident Management System API')
    .setDescription('API for managing residents and complaints in ABC Apartment')
    .setVersion('1.0')
    .addBearerAuth()
    .build();
  const document = SwaggerModule.createDocument(app, config);
  SwaggerModule.setup('api/docs', app, document);

  const port = process.env.PORT || 3001;
  await app.listen(port);
  console.log(`🚀 Backend server running on http://localhost:${port}`);
  console.log(`📚 API Documentation available at http://localhost:${port}/api/docs`);
}

bootstrap();
