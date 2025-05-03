import {Module} from '@nestjs/common';
import { AccountController } from './account.controller';
import { AccountService } from './account.service';
import { JwtModule } from '@nestjs/jwt';
import { PassportModule } from '@nestjs/passport';
import { Auth0Strategy } from './strategies/auth0.strategy';

@Module({
    imports:[
        PassportModule,
		JwtModule.register({})
    ],
    providers:[
        AccountService,  Auth0Strategy
    ]
    ,
    controllers: [AccountController],
    exports: [AccountService]
})

export class AccountModule {};