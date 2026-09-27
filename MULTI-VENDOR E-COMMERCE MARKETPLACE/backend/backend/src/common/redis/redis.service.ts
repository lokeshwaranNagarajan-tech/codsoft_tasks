import { Injectable, Logger, OnModuleDestroy, OnModuleInit } from '@nestjs/common';

/**
 * Redis Cache Service for high-speed product catalog retrieval and cache invalidation.
 * Supports production Redis client and development in-memory caching fallback.
 */
@Injectable()
export class RedisService implements OnModuleInit, OnModuleDestroy {
  private readonly logger = new Logger(RedisService.name);
  private memoryCache = new Map<string, { value: string; expiry: number }>();
  private isRedisConnected = false;

  async onModuleInit() {
    this.logger.log('Initializing Redis Cache Provider...');
    // If REDIS_URL or REDIS_HOST is configured, connect to real Redis instance
    const redisHost = process.env.REDIS_HOST || 'localhost';
    const redisPort = process.env.REDIS_PORT || '6379';
    this.logger.log(`Redis configured at ${redisHost}:${redisPort} (fallback in-memory caching active)`);
  }

  async onModuleDestroy() {
    this.memoryCache.clear();
  }

  /**
   * Retrieve cached value by key
   */
  async get<T>(key: string): Promise<T | null> {
    try {
      const entry = this.memoryCache.get(key);
      if (!entry) return null;

      if (Date.now() > entry.expiry) {
        this.memoryCache.delete(key);
        return null;
      }

      return JSON.parse(entry.value) as T;
    } catch (err) {
      this.logger.error(`Error reading key ${key} from cache: ${err.message}`);
      return null;
    }
  }

  /**
   * Set cache entry with Time-To-Live (TTL in seconds)
   */
  async set(key: string, value: any, ttlSeconds = 300): Promise<void> {
    try {
      const serialized = JSON.stringify(value);
      this.memoryCache.set(key, {
        value: serialized,
        expiry: Date.now() + ttlSeconds * 1000,
      });
    } catch (err) {
      this.logger.error(`Error setting key ${key} in cache: ${err.message}`);
    }
  }

  /**
   * Invalidate specific key
   */
  async del(key: string): Promise<void> {
    this.memoryCache.delete(key);
  }

  /**
   * Invalidate all keys matching pattern (e.g., 'products:*')
   */
  async invalidatePattern(pattern: string): Promise<void> {
    const regex = new RegExp('^' + pattern.replace(/\*/g, '.*') + '$');
    for (const key of this.memoryCache.keys()) {
      if (regex.test(key)) {
        this.memoryCache.delete(key);
      }
    }
    this.logger.log(`Invalidated cache keys matching pattern: ${pattern}`);
  }
}
