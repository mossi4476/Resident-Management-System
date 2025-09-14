import { Injectable, Inject } from '@nestjs/common';
import { CACHE_MANAGER } from '@nestjs/cache-manager';
import { Cache } from 'cache-manager';
import { ConfigService } from '@nestjs/config';
import { createClient, RedisClientType } from 'redis';

@Injectable()
export class RedisService {
  private redisClient: RedisClientType;

  constructor(
    @Inject(CACHE_MANAGER) private cacheManager: Cache,
    private configService: ConfigService,
  ) {
    this.initializeRedisClient();
  }

  private async initializeRedisClient() {
    const redisUrl = this.configService.get('REDIS_URL');
    
    if (!redisUrl) {
      console.log('ℹ️ No Redis URL configured, using memory cache only');
      return;
    }
    
    try {
      this.redisClient = createClient({
        url: redisUrl,
        socket: {
          reconnectStrategy: (retries) => {
            if (retries > 3) {
              console.warn('⚠️ Redis connection failed after 3 retries, using memory cache only');
              return false; // Stop retrying
            }
            return Math.min(retries * 100, 3000); // Exponential backoff
          },
        },
      });

      this.redisClient.on('error', (err) => {
        console.warn('⚠️ Redis Client Error (continuing without Redis):', err.message);
        this.redisClient = null; // Set to null to prevent further operations
      });

      this.redisClient.on('connect', () => {
        console.log('✅ Redis Client Connected');
      });

      this.redisClient.on('close', () => {
        console.warn('⚠️ Redis connection closed, using memory cache only');
        this.redisClient = null;
      });

      await this.redisClient.connect();
    } catch (error) {
      console.warn('⚠️ Redis connection failed (continuing without Redis):', error.message);
      this.redisClient = null;
    }
  }

  // Cache operations using NestJS Cache Manager
  async get<T>(key: string): Promise<T | undefined> {
    return this.cacheManager.get<T>(key);
  }

  async set(key: string, value: any, ttl?: number): Promise<void> {
    await this.cacheManager.set(key, value, ttl);
  }

  async del(key: string): Promise<void> {
    await this.cacheManager.del(key);
  }

  async reset(): Promise<void> {
    await this.cacheManager.reset();
  }

  // Direct Redis operations
  async getRedisClient(): Promise<RedisClientType | null> {
    return this.redisClient;
  }

  async publish(channel: string, message: string): Promise<number> {
    if (!this.redisClient) {
      console.warn('⚠️ Redis not available, skipping publish operation');
      return 0;
    }
    return this.redisClient.publish(channel, message);
  }

  async subscribe(channel: string, callback: (message: string) => void): Promise<void> {
    if (!this.redisClient) {
      console.warn('⚠️ Redis not available, skipping subscribe operation');
      return;
    }
    await this.redisClient.subscribe(channel, callback);
  }

  async unsubscribe(channel: string): Promise<void> {
    if (!this.redisClient) {
      console.warn('⚠️ Redis not available, skipping unsubscribe operation');
      return;
    }
    await this.redisClient.unsubscribe(channel);
  }

  // Session management
  async setSession(sessionId: string, data: any, ttl: number = 3600): Promise<void> {
    await this.set(`session:${sessionId}`, data, ttl);
  }

  async getSession(sessionId: string): Promise<any> {
    return this.get(`session:${sessionId}`);
  }

  async deleteSession(sessionId: string): Promise<void> {
    await this.del(`session:${sessionId}`);
  }

  // User cache
  async cacheUser(userId: string, userData: any, ttl: number = 1800): Promise<void> {
    await this.set(`user:${userId}`, userData, ttl);
  }

  async getCachedUser(userId: string): Promise<any> {
    return this.get(`user:${userId}`);
  }

  async invalidateUserCache(userId: string): Promise<void> {
    await this.del(`user:${userId}`);
  }

  // Complaint cache
  async cacheComplaint(complaintId: string, complaintData: any, ttl: number = 900): Promise<void> {
    await this.set(`complaint:${complaintId}`, complaintData, ttl);
  }

  async getCachedComplaint(complaintId: string): Promise<any> {
    return this.get(`complaint:${complaintId}`);
  }

  async invalidateComplaintCache(complaintId: string): Promise<void> {
    await this.del(`complaint:${complaintId}`);
  }

  // Rate limiting
  async incrementRateLimit(key: string, ttl: number = 60): Promise<number> {
    const current = await this.get<number>(key) || 0;
    const newValue = current + 1;
    await this.set(key, newValue, ttl);
    return newValue;
  }

  async getRateLimit(key: string): Promise<number> {
    return this.get<number>(key) || 0;
  }

  // Health check
  async ping(): Promise<string> {
    if (!this.redisClient) {
      return 'Redis not available';
    }
    try {
      return await this.redisClient.ping();
    } catch (error) {
      return 'Redis ping failed';
    }
  }

  async onModuleDestroy() {
    if (this.redisClient) {
      try {
        await this.redisClient.quit();
      } catch (error) {
        console.warn('⚠️ Error closing Redis connection:', error.message);
      }
    }
  }
}
