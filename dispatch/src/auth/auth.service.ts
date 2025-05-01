import { Injectable } from "@nestjs/common";
import { InjectModel } from "@nestjs/mongoose";
import { User } from "./user.chema";
import { Model } from "mongoose";
import { CreateUserDto } from "./dto/CreateUser.dto";
import { LoginUserDto } from "./dto/LoginUser.dto";
import { JwtService } from "@nestjs/jwt"; // Add this line

@Injectable()
export class AuthService {
    constructor(
        @InjectModel(User.name) 
            public userModel: Model<User>,
        private jwtService: JwtService
    ) {}
    
    async createUser(createUserDto: CreateUserDto): Promise<{token: string}> {
        const user = new this.userModel(createUserDto);
        await user.save();
        const token = this.jwtService.sign({id: user._id});
        return {token};
    }

    async verifyUser(loginUserDto: LoginUserDto): Promise<{token: string}> {
        console.log('In Verify User (Service)');
        const user = await this.userModel.findOne(loginUserDto);
        if(user){
            const token = this.jwtService.sign({id: user._id});
            return {token};
        }
    }
}