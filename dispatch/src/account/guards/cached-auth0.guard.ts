import {
  Injectable,
  CanActivate,
  ExecutionContext,
  Inject,
  UnauthorizedException
} from '@nestjs/common';
import { Request } from 'express';
import { CACHE_MANAGER } from '@nestjs/cache-manager';
import { Cache } from 'cache-manager';
import { AccountService } from '../account.service';

@Injectable()
export class CachedAuth0Guard implements CanActivate {
  constructor(
    @Inject(CACHE_MANAGER) private cacheManager: Cache,
    private authService: AccountService
  ) {}

  async canActivate(context: ExecutionContext): Promise<boolean> {
    const request = context.switchToHttp().getRequest<Request>();
    const authHeader = request.headers['authorization'];

    if (!authHeader || !authHeader.startsWith('Bearer ')) {
      throw new UnauthorizedException('No access token found');
    }

    const token = authHeader.split(' ')[1];
    
    // Try to get user from cache first
    const cachedUser = await this.cacheManager.get(`auth_token:${token}`);
    
    if (cachedUser) {
      // If user exists in cache, attach to request
      request.user = cachedUser;
      return true;
    }

    try {
      // If not in cache, validate with Auth0
      const user = await this.authService.validateAccessToken(token);
      
      // Calculate TTL - default to 5 minutes if we can't determine from token
      let ttl = 300; // 5 minutes default
      
      // Store in cache
      await this.cacheManager.set(`auth_token:${token}`, user, ttl);
      
      // Attach user to request
      request.user = user;
      return true;
    } catch (error) {
      throw new UnauthorizedException('Invalid Auth0 token');
    }
  }
}
