import { Injectable, Inject, Logger } from '@nestjs/common';
import { PassportStrategy } from '@nestjs/passport';
import { ExtractJwt, Strategy } from 'passport-jwt';
import { passportJwtSecret } from 'jwks-rsa';
import * as jwksRsa from 'jwks-rsa';
import { CACHE_MANAGER } from '@nestjs/cache-manager';
import { Cache } from 'cache-manager';
import { createCacheKey } from '../../utils/token-cache.util';

@Injectable()
export class Auth0Strategy extends PassportStrategy(Strategy, 'auth0') {
	private readonly logger = new Logger('Auth0Strategy');
	
	constructor(
    @Inject(CACHE_MANAGER) private cacheManager: Cache
  ) {
		super({
		  secretOrKeyProvider: jwksRsa.passportJwtSecret({
			cache: true,
			rateLimit: true,
			jwksRequestsPerMinute: 5,
			jwksUri: `https://${process.env.AUTH0_DOMAIN}/.well-known/jwks.json`,
		  }),
		  jwtFromRequest: ExtractJwt.fromAuthHeaderAsBearerToken(),
		  audience: process.env.AUTH0_AUDIENCE,
		  issuer: `https://${process.env.AUTH0_DOMAIN}/`,
		  algorithms: ['RS256'],
      passReqToCallback: true, // This allows us to access the request in validate
		});
	  }
  async validate(request: any, payload: any) {
    // Extract the token from the request
    const authHeader = request.headers.authorization;
    const token = authHeader && authHeader.split(' ')[1];
    
    // Store the validated payload in cache
    if (token) {
      // Calculate TTL based on token expiration
      const now = Math.floor(Date.now() / 1000);
      const exp = payload.exp || now + 3600; // Default to 1 hour if no exp claim
      const ttl = Math.max(60 * 30, exp - now); // At least 30 minutes, or until token expires
      
      const cacheKey = createCacheKey(token);
      const userData = {
        userId: payload.sub,
        email: payload.email,
        scope: payload.scope,
        // Add any other fields from payload you need
      };
      
      this.logger.debug(`Caching validated token with key ${cacheKey} for ${ttl} seconds`);
      await this.cacheManager.set(cacheKey, userData, ttl);
    }
    
    this.logger.debug('JWT strategy validation successful', { sub: payload.sub });
    return {
      userId: payload.sub, // Auth0 uses 'sub' for user ID
      email: payload.email,
      scope: payload.scope, // Include other claims as needed
    };
  }
}