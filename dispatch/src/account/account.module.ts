import {Module} from '@nestjs/common';
import { AccountController } from './account.controller';
import { AccountService } from './account.service';
import { JwtModule } from '@nestjs/jwt';
import { PassportModule } from '@nestjs/passport';
import { Auth0Strategy } from './strategies/auth0.strategy';
import { MongooseModule } from '@nestjs/mongoose';
import { AccountProfile, AccountProfileSchema } from './accountProfile.chema';
import { CachedAuth0Guard } from './guards/cached-auth0.guard';
import { Follow, FollowSchema } from './follow.schema';
import { Post, PostSchema } from '../blog/post/post.chema';

//account ~ profile ~ user
@Module({
    imports:[
        PassportModule,		MongooseModule.forFeature([
            {
                name: AccountProfile.name,
                schema: AccountProfileSchema
            },
            {
                name: Follow.name,
                schema: FollowSchema
            },
            {
                name: Post.name,
                schema: PostSchema
            }
        ]),
		JwtModule.register({})
    ],    providers:[
        AccountService, Auth0Strategy, CachedAuth0Guard
    ]
    ,
    controllers: [AccountController],
    exports: [AccountService, CachedAuth0Guard]
})

export class AccountModule {};