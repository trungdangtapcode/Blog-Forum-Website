import {PassportStrategy} from '@nestjs/passport';
import { Strategy } from 'passport-local';
import { AuthService } from '../auth.service';
import { Injectable, UnauthorizedException } from '@nestjs/common';

@Injectable()
export class LocalStrategy extends PassportStrategy(Strategy){
    constructor(private AuthService: AuthService){
        super({
            usernameField: 'email'
        });
    }

    async validate(email: string, password: string): Promise<any>{
        console.log('In Local Strategy');
        const user = this.AuthService.verifyUser({email, password});
        if (!user) throw new UnauthorizedException();
        return user;
    }
}