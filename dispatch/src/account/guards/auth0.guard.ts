// auth.guard.ts
import {
    CanActivate,
    ExecutionContext,
    Injectable,
    UnauthorizedException,
  } from '@nestjs/common';
  import { Request } from 'express';
  import { AccountService } from './../account.service';
  
  @Injectable()
  export class Auth0Guard implements CanActivate {
    constructor(private authService: AccountService) {}
  
    async canActivate(context: ExecutionContext): Promise<boolean> {
      const request = context.switchToHttp().getRequest<Request>();
      const authHeader = request.headers['authorization'];
  
      if (!authHeader || !authHeader.startsWith('Bearer ')) {
        throw new UnauthorizedException('No access token found');
      }
  
      const token = authHeader.split(' ')[1];
  
      const user = await this.authService.validateAccessToken(token);
      request.user = user; // attach user info for controllers
  
      return true;
    }
  }
  