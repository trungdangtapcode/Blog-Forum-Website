// auth.guard.ts
import {
    CanActivate,
    ExecutionContext,
    Injectable,
    UnauthorizedException,
    Inject,
    Logger,
  } from '@nestjs/common';
  import { Request } from 'express';
  import { AccountService } from './../account.service';
  import { CACHE_MANAGER } from '@nestjs/cache-manager';
  import { Cache } from 'cache-manager';
  import { createCacheKey } from '../../utils/token-cache.util';
  
  @Injectable()
  export class Auth0Guard implements CanActivate {
    private readonly logger = new Logger('Auth0Guard');
    
    constructor(
      private authService: AccountService,
      @Inject(CACHE_MANAGER) private cacheManager: Cache
    ) {}
  
    async canActivate(context: ExecutionContext): Promise<boolean> {
      const request = context.switchToHttp().getRequest<Request>();
      const authHeader = request.headers['authorization'];
  
      if (!authHeader || !authHeader.startsWith('Bearer ')) {
        throw new UnauthorizedException('No access token found');
      }
  
      const token = authHeader.split(' ')[1];
      const cacheKey = createCacheKey(token);
      
      // Try to get user from cache first
      const cachedUser = await this.cacheManager.get(cacheKey);
      
      if (cachedUser) {
        this.logger.debug('Cache hit: Using cached Auth0 token validation');
        // If user exists in cache, attach to request
        request.user = cachedUser;
        return true;
      }
        try {
        this.logger.debug('Cache miss: Validating Auth0 token with API');
        // If not in cache, validate with Auth0
        const user = await this.authService.validateAccessToken(token);
        
        // Cache the result for 15 minutes (900 seconds) to reduce API calls
        // Auth0 recommends caching tokens that have already been validated
        await this.cacheManager.set(cacheKey, user, 900);
        
        // Attach user to request
        request.user = user;
        return true;
      } catch (error) {
        this.logger.error(`Auth0 token validation failed: ${error.message}`);
        throw new UnauthorizedException('Invalid Auth0 token');
      }
    }
  }
  