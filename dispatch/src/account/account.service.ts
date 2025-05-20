import { Injectable, UnauthorizedException, Inject, Logger } from "@nestjs/common";
import { InjectModel } from "@nestjs/mongoose";
import { Model } from "mongoose";
import { JwtService } from "@nestjs/jwt"; // Add this line
import { AccountProfile } from './accountProfile.chema';
import { UpdateProfileDto } from "./dto/UpdateProfile.dto";
import axios from "axios";
import { CACHE_MANAGER } from "@nestjs/cache-manager";
import { Cache } from "cache-manager";
import { createCacheKey } from "../utils/token-cache.util";

@Injectable()
export class AccountService {
    constructor(
        @InjectModel(AccountProfile.name) 
        public profileModel: Model<AccountProfile>,
        @Inject(CACHE_MANAGER) private cacheManager: Cache
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

    async getPublicProfile(userId: string): Promise<AccountProfile> {
        const profile = await this.profileModel.findById(userId);
        if (!profile) {
            throw new UnauthorizedException('Profile not found');
        }
        // Optionally, you can exclude sensitive information here
        return profile;
    }	private readonly logger = new Logger('AccountService');

	async validateAccessToken(accessToken: string): Promise<any> {
		try {
			// Check cache first - using secure hash instead of raw token
			const cacheKey = createCacheKey(accessToken);
			const cachedUser = await this.cacheManager.get(cacheKey);
			if (cachedUser) {
				this.logger.debug('Using cached user data from AccountService');
				return cachedUser;
			}

			this.logger.debug('Cache miss: Fetching user from Auth0 API');
			// If not in cache, make the API call
			const url = `https://${process.env.AUTH0_DOMAIN}/userinfo`;
			
			try {
				const response = await axios.get(url, {
					headers: {
						Authorization: `Bearer ${accessToken}`,
					},
					timeout: 5000, // Set a timeout to avoid hanging connections
				});

				// Cache the result - for 30 minutes (1800 seconds) to significantly reduce API calls
				// Using longer cache for tokens that have already been validated with Auth0
				await this.cacheManager.set(cacheKey, response.data, 1800);
				
				return response.data; // contains user info like sub, email, etc.
			} catch (axiosError) {
				if (axiosError.response) {
					// Auth0 responded with an error
					this.logger.error(`Auth0 API error: ${axiosError.response.status} - ${axiosError.response.data?.error || 'Unknown error'}`);
					if (axiosError.response.status === 429) {
						this.logger.error('Rate limit exceeded with Auth0 API!');
					}
				} else if (axiosError.request) {
					// No response received
					this.logger.error('No response received from Auth0 API');
				}
				throw axiosError;
			}
		} catch (error) {
			this.logger.error(`Auth0 API validation error: ${error.message}`);
			throw new UnauthorizedException('Invalid Auth0 token');
		}
	}
}