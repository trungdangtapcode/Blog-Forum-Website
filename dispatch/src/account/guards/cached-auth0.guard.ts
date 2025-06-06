import {
  Injectable,
  CanActivate,
  ExecutionContext,
  Inject,
  UnauthorizedException,
  Logger,
  OnModuleInit
} from '@nestjs/common';
import { Request } from 'express';
import { CACHE_MANAGER } from '@nestjs/cache-manager';
import { Cache } from 'cache-manager';
import { AccountService } from '../account.service';
import { createCacheKey } from '../../utils/token-cache.util';

/**
 * PROBLEM ANALYSIS:
 * 
 * The cache miss issue is likely due to one or more of the following:
 * 1. Hot reloading in development mode clearing the cache between requests
 * 2. Multiple instances of NestJS running (due to HMR)
 * 3. Memory leaks or cache evictions due to configuration issues
 * 4. Thread synchronization issues with the cache
 * 
 * SOLUTION:
 * Implement a more robust caching approach with fallback mechanisms
 * and proper logging to diagnose the specific issue.
 */

@Injectable()
export class CachedAuth0Guard implements CanActivate, OnModuleInit {
  private readonly logger = new Logger('CachedAuth0Guard');
  private cacheHealthy = false;
  private requestCount = 0;
  private cacheHits = 0;
  private cacheMisses = 0;
  
  // Use a local in-memory cache as fallback for the injected cache
  private localCache: Map<string, {data: any, expiry: number}> = new Map();
  
  constructor(
    @Inject(CACHE_MANAGER) private cacheManager: Cache,
    private authService: AccountService
  ) {}

  async onModuleInit() {
    // Test cache functionality when the module initializes
    try {
      const testKey = 'test_cache_key';
      const testValue = { test: 'data' };
      
      await this.cacheManager.set(testKey, testValue, 1800);
      const retrievedValue = await this.cacheManager.get(testKey);
      
      if (
        retrievedValue &&
        typeof retrievedValue === 'object' &&
        (retrievedValue as { test?: string }).test === 'data'
      ) {
        this.logger.log('✅ Cache TEST successful - cache appears to be working correctly');
        this.cacheHealthy = true;
      } else {
        this.logger.error('❌ Cache TEST failed - cached values cannot be retrieved');
      }
    } catch (error) {
      this.logger.error(`❌ Cache initialization error: ${error.message}`);
    }
  }

  async canActivate(context: ExecutionContext): Promise<boolean> {
    this.requestCount++;
    
    // Log cache statistics every 10 requests
    if (this.requestCount % 10 === 0) {
      const hitRate = this.cacheHits / this.requestCount * 100;
      this.logger.log(`Cache statistics: ${this.cacheHits} hits, ${this.cacheMisses} misses (${hitRate.toFixed(1)}% hit rate)`);
    }
    
    const request = context.switchToHttp().getRequest<Request>();
    const authHeader = request.headers['authorization'];

    if (!authHeader || !authHeader.startsWith('Bearer ')) {
      throw new UnauthorizedException('No access token found');
    }

    const token = authHeader.split(' ')[1];
    // Avoid logging sensitive information in production
    this.logger.debug(`Token received (first 10 chars): ${token.substring(0, 10)}...`);
    
    // Use the same cache key format as in AccountService
    const cacheKey = createCacheKey(token);
    this.logger.debug(`Cache key: ${cacheKey}`);
    
    try {
      // Check both caches for the user data - first the main cache, then fallback
      let cachedUser = null;
      
      // 1. Try the injected cache manager
      try {
        cachedUser = await this.cacheManager.get(cacheKey);
        if (cachedUser) {
          this.logger.debug(`Found user in primary cache for key: ${cacheKey}`);
        }
      } catch (cacheError) {
        this.logger.error(`Primary cache access error: ${cacheError.message}`);
      }
      
      // 2. Try the local fallback cache if primary cache failed
      if (!cachedUser) {
        const localCacheEntry = this.localCache.get(cacheKey);
        if (localCacheEntry && localCacheEntry.expiry > Date.now()) {
          cachedUser = localCacheEntry.data;
          this.logger.debug(`Found user in fallback cache for key: ${cacheKey}`);
        } else if (localCacheEntry) {
          this.logger.debug(`Fallback cache entry expired for key: ${cacheKey}`);
          this.localCache.delete(cacheKey);
        }
      }
      
      // If we found the user in either cache, use it
      if (cachedUser) {
        this.cacheHits++;
        this.logger.debug(`✅ CACHE HIT for key: ${cacheKey}`);
        request.user = cachedUser;
        return true;
      } else {
        this.cacheMisses++;
        this.logger.debug(`❌ CACHE MISS for key: ${cacheKey}`);
      }      // If cache miss, validate with Auth0
      this.logger.debug('Validating token with Auth0');
      const user = await this.authService.validateAccessToken(token);
      
      // Ensure we have a userId property for compatibility
      if (user && user.sub && !user.userId) {
        user.userId = user.sub; // Use the Auth0 subject ID as userId
        this.logger.debug(`Set userId from Auth0 sub: ${user.sub}`);
      }
      
      if (!user || (!user.userId && !user.sub)) {
        this.logger.error('No user ID found in Auth0 response', user);
        throw new UnauthorizedException('Invalid or incomplete user data');
      }
      
      // Store in both caches for redundancy
      try {
        const ttl = 1800; // 30 minutes
        
        // Primary cache
        await this.cacheManager.set(cacheKey, user, ttl);
        
        // Fallback cache
        this.localCache.set(cacheKey, {
          data: user,
          expiry: Date.now() + (ttl * 1000)
        });
        
        // Verify primary cache write
        const verifyCache = await this.cacheManager.get(cacheKey);
        if (verifyCache) {
          this.logger.debug(`✅ Primary cache write verification successful for key: ${cacheKey}`);
        } else {
          this.logger.warn(`⚠️ Primary cache write verification FAILED for key: ${cacheKey}`);
        }
      } catch (cacheError) {
        this.logger.error(`Cache write error: ${cacheError.message}`);
      }
      
      // Perform cache cleanup every 100 requests to prevent memory leaks
      if (this.requestCount % 100 === 0) {
        this._cleanupLocalCache();
      }
      
      // Attach user to request
      request.user = user;
      return true;
    } catch (error) {
      this.logger.error(`Authentication error: ${error.message}`);
      throw new UnauthorizedException('Invalid Auth0 token');
    }
  }
  
  /**
   * Cleanup expired entries from the local cache to prevent memory leaks
   */
  private _cleanupLocalCache(): void {
    const now = Date.now();
    let expiredCount = 0;
    
    for (const [key, entry] of this.localCache.entries()) {
      if (entry.expiry < now) {
        this.localCache.delete(key);
        expiredCount++;
      }
    }
    
    if (expiredCount > 0) {
      this.logger.debug(`Cleaned up ${expiredCount} expired entries from local cache`);
    }
  }
}
