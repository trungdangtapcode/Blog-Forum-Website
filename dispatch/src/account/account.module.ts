import {Module} from '@nestjs/common';
import { AccountController } from './account.controller';
import { AccountService } from './account.service';
import { JwtModule } from '@nestjs/jwt';
import { PassportModule } from '@nestjs/passport';
import { Auth0Strategy } from './strategies/auth0.strategy';
import { MongooseModule } from '@nestjs/mongoose';
import { AccountProfile, AccountProfileSchema } from './accountProfile.chema';

@Module({
    imports:[
        PassportModule,
		MongooseModule.forFeature([
            {
                name: AccountProfile.name,
                schema: AccountProfileSchema
            },

        ]),
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