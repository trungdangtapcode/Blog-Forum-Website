
import {
  CanActivate,
  ExecutionContext,
  Injectable,
  UnauthorizedException,
  Logger,
} from '@nestjs/common';
import { Request } from 'express';
import { TokenService } from '../../utils/token.service';

@Injectable()
export class Auth0Guard implements CanActivate {
  private readonly logger = new Logger('Auth0Guard');

  constructor(private tokenService: TokenService) {}

  async canActivate(context: ExecutionContext): Promise<boolean> {
    const request = context.switchToHttp().getRequest<Request>();
    const authHeader = request.headers['authorization'];

    if (!authHeader || !authHeader.startsWith('Bearer ')) {
      throw new UnauthorizedException('No access token found');
    }

    const token = authHeader.split(' ')[1];

    try {
      // TokenService handles all the caching logic internally
      const userData = await this.tokenService.validateToken(token);

      // Attach user data to request
      request.user = userData;
      return true;
    } catch (error) {
      this.logger.error(`Token validation failed: ${error.message}`);
      throw new UnauthorizedException('Invalid token');
    }
  }
}
  