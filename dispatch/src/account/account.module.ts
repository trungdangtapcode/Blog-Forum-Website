import {Module} from '@nestjs/common';
import { AccountController } from './account.controller';
import { AccountService } from './account.service';
import { JwtModule } from '@nestjs/jwt';
import { PassportModule } from '@nestjs/passport';
import { Auth0Strategy } from './strategies/auth0.strategy';
import { MongooseModule } from '@nestjs/mongoose';
import { AccountProfile, AccountProfileSchema } from './accountProfile.chema';
import { Auth0Guard } from './guards/auth0.guard';

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
        AccountService,  Auth0Strategy, Auth0Guard
    ]
    ,
    controllers: [AccountController],
    exports: [AccountService, Auth0Guard]
})

export class AccountModule {};