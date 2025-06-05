import {Module, forwardRef} from '@nestjs/common';
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
import { Notification, NotificationSchema } from './notification.schema';
import { NotificationService } from './notification.service';
import { NotificationController } from './notification.controller';
import { MailerModule } from '../mailer/mailer.module';

//account ~ profile ~ user
@Module({    
    imports:[
        PassportModule,
        MongooseModule.forFeature([
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
            },
            {
                name: Notification.name,
                schema: NotificationSchema
            }
        ]),        JwtModule.register({}),
        // Import MailerModule to make MailerService available in this module
        forwardRef(() => MailerModule)
    ],providers:[
        AccountService, Auth0Strategy, CachedAuth0Guard, NotificationService
    ]
    ,    
    controllers: [AccountController, NotificationController],
    exports: [AccountService, CachedAuth0Guard, NotificationService, MongooseModule] // Export MongooseModule to make NotificationModel available
})

export class AccountModule {};