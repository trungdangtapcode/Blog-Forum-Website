import { Injectable, UnauthorizedException } from "@nestjs/common";
import { InjectModel } from "@nestjs/mongoose";
import { Model } from "mongoose";
import { JwtService } from "@nestjs/jwt"; // Add this line
import { AccountProfile } from './accountProfile.chema';
import { UpdateProfileDto } from "./dto/UpdateProfile.dto";
import axios from "axios";

@Injectable()
export class AccountService {
    constructor(
        @InjectModel(AccountProfile.name) 
        public profileModel: Model<AccountProfile>
    ) {}

	async updateProfile(email: string, profileData: Partial<UpdateProfileDto>){
		// console.log('Inside Account Service', email, profileData);
		const profile = await this.profileModel.findOne({email: email});
		console.log('con me')
		console.log(profile)
		if(profile){
			Object.assign(profile, profileData);
			await profile.save();
		} else {
			const newProfile = new this.profileModel({
				email: email,
				...profileData
			});
			await newProfile.save();
		}
		return {message: "Profile Updated"};
	}

	async getProfile(email: string): Promise<AccountProfile> {
		const profile = await this.profileModel.findOne({email: email});
		if(profile){
			return profile;
		} else {
			this.updateProfile(email, {email: email});
			return this.getProfile(email);
		}
	}

	async validateAccessToken(accessToken: string): Promise<any> {
		try {
			const url = `https://${process.env.AUTH0_DOMAIN}/userinfo`
			console.log(url, accessToken)
		  	const response = await axios.get(url, {
				headers: {
				Authorization: `Bearer ${accessToken}`,
				},
		  });
	
		  return response.data; // contains user info like sub, email, etc.
		} catch (error) {
		  throw new UnauthorizedException('Invalid Auth0 token');
		}
	}
}