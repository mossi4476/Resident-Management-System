import { Module } from '@nestjs/common';
import { CacheModule } from '@nestjs/cache-manager';
import { ConfigModule, ConfigService } from '@nestjs/config';
import { RedisService } from './redis.service';

@Module({
  imports: [
    CacheModule.registerAsync({
      imports: [ConfigModule],
      useFactory: async (configService: ConfigService) => {
        const redisUrl = configService.get('REDIS_URL');
        
        // If no Redis URL, use memory store
        if (!redisUrl) {
          return {
            ttl: 3600,
            max: 1000,
          };
        }

        // Try to use Redis store
        try {
          const { redisStore } = await import('cache-manager-redis-store');
          return {
            store: redisStore as any,
            host: configService.get('REDIS_HOST', 'localhost'),
            port: configService.get('REDIS_PORT', 6379),
            password: configService.get('REDIS_PASSWORD'),
            ttl: configService.get('REDIS_TTL', 3600),
            max: configService.get('REDIS_MAX', 1000),
          };
        } catch (error) {
          console.warn('⚠️ Redis store not available, using memory store');
          return {
            ttl: 3600,
            max: 1000,
          };
        }
      },
      inject: [ConfigService],
      isGlobal: true,
    }),
  ],
  providers: [RedisService],
  exports: [RedisService],
})
export class RedisModule {}
