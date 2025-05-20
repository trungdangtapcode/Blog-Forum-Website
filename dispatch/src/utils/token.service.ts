import { Injectable, Logger, Inject } from '@nestjs/common';
import { CACHE_MANAGER } from '@nestjs/cache-manager';
import { Cache } from 'cache-manager';
import { createCacheKey } from './token-cache.util';
import axios from 'axios';

/**
 * TokenService provides centralized token validation with advanced caching
 * to avoid Auth0 rate limits.
 */
@Injectable()
export class TokenService {
  private readonly logger = new Logger('TokenService');
  
  // Cache settings
  private readonly DEFAULT_TTL = 1800; // 30 minutes
  private readonly AUTH0_API_TIMEOUT = 5000; // 5 seconds
  
  constructor(@Inject(CACHE_MANAGER) private cacheManager: Cache) {}
  
  /**
   * Validates a token, using cache when possible to avoid API calls
   * 
   * @param token The Bearer token to validate
   * @returns The user data from the token 
   */
  async validateToken(token: string): Promise<any> {
    // Create a secure hash of the token for caching
    const cacheKey = createCacheKey(token);
    
    // Try to get from cache first
    const cachedUser = await this.cacheManager.get(cacheKey);
    if (cachedUser) {
      this.logger.debug('Cache hit: Using cached token data');
      return cachedUser;
    }
    
    this.logger.debug('Cache miss: Validating token with Auth0 API');
    try {
      // Not in cache, validate with Auth0
      const userData = await this.fetchUserInfo(token);
      
      // Cache the valid token data
      await this.cacheManager.set(cacheKey, userData, this.DEFAULT_TTL);
      
      return userData;
    } catch (error) {
      this.logger.error(`Token validation failed: ${error.message}`);
      throw error;
    }
  }
  
  /**
   * Call Auth0 userinfo endpoint to validate token
   */
  private async fetchUserInfo(token: string): Promise<any> {
    try {
      const url = `https://${process.env.AUTH0_DOMAIN}/userinfo`;
      const response = await axios.get(url, {
        headers: {
          Authorization: `Bearer ${token}`,
        },
        timeout: this.AUTH0_API_TIMEOUT,
      });
      
      return response.data;
    } catch (error) {
      // Enhanced error handling
      if (error.response) {
        // Auth0 returned an error response
        this.logger.error(`Auth0 API error: ${error.response.status} - ${error.response.data?.error || 'Unknown'}`);
        
        if (error.response.status === 429) {
          this.logger.error('Auth0 rate limit exceeded!');
        }
      } else if (error.request) {
        this.logger.error('No response received from Auth0 API');
      }
      throw error;
    }
  }
  
  /**
   * Invalidate a cached token (useful for logout)
   */
  async invalidateToken(token: string): Promise<void> {
    const cacheKey = createCacheKey(token);
    await this.cacheManager.del(cacheKey);
    this.logger.debug(`Invalidated cached token: ${cacheKey}`);
  }
}
