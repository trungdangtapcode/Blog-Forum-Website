import { Injectable } from "@nestjs/common";
import { InjectModel } from "@nestjs/mongoose";
import { Model } from "mongoose";
import { JwtService } from "@nestjs/jwt"; // Add this line
import { AccountProfile } from './accountProfile.chema';

@Injectable()
export class AccountService {
    constructor(
        // @InjectModel('AccountProfile') 
        // public userModel: Model<AccountProfile>
    ) {}
}