import { Injectable } from '@nestjs/common';
import { PassportStrategy } from '@nestjs/passport';
import { ExtractJwt, Strategy } from 'passport-jwt';
import { passportJwtSecret } from 'jwks-rsa';
import * as jwksRsa from 'jwks-rsa';

@Injectable()
export class Auth0Strategy extends PassportStrategy(Strategy, 'auth0') {
	constructor() {
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
		});
	  }

  async validate(payload: any) {
    // Payload is the decoded JWT
	console.log('Inside JWT auth0 Strategy', payload);
    return {
      userId: payload.sub, // Auth0 uses 'sub' for user ID
      email: payload.email,
      scope: payload.scope, // Include other claims as needed
    };
  }
}