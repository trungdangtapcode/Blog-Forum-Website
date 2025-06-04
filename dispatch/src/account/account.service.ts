import { Injectable, UnauthorizedException, Inject, Logger, ConflictException, NotFoundException } from "@nestjs/common";
import { InjectModel } from "@nestjs/mongoose";
import { Model } from "mongoose";
import { JwtService } from "@nestjs/jwt";
import { AccountProfile } from './accountProfile.chema';
import { Follow } from './follow.schema';
import { UpdateProfileDto } from "./dto/UpdateProfile.dto";
import axios from "axios";
import { CACHE_MANAGER } from "@nestjs/cache-manager";
import { Cache } from "cache-manager";
import { createCacheKey } from "../utils/token-cache.util";
import { Post } from "../blog/post/post.chema";

@Injectable()
export class AccountService {
    constructor(
        @InjectModel(AccountProfile.name) 
        public profileModel: Model<AccountProfile>,
        @InjectModel(Follow.name)
        private followModel: Model<Follow>,
        @InjectModel(Post.name)
        private postModel: Model<Post>,
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
        
        // Create a new object without sensitive fields
        const publicProfile = profile.toObject();
        return publicProfile;
    }
    
    async getSavedPosts(email: string): Promise<string[]> {
        const profile = await this.profileModel.findOne({ email }).exec();
        if (!profile) {
            return [];
        }
        return profile.savedPosts || [];
    }
    
    async addSavedPost(email: string, postId: string): Promise<string[]> {
        const profile = await this.profileModel.findOne({ email }).exec();
        if (!profile) {
            throw new UnauthorizedException('Profile not found');
        }
        
        if (!profile.savedPosts) {
            profile.savedPosts = [];
        }
        
        if (!profile.savedPosts.includes(postId)) {
            profile.savedPosts.push(postId);
            await profile.save();
        }
        
        return profile.savedPosts;
    }
    
    async removeSavedPost(email: string, postId: string): Promise<string[]> {
        const profile = await this.profileModel.findOne({ email }).exec();
        if (!profile) {
            throw new UnauthorizedException('Profile not found');
        }
        
        if (profile.savedPosts && profile.savedPosts.includes(postId)) {
            profile.savedPosts = profile.savedPosts.filter(id => id !== postId);
            await profile.save();
        }
        
        return profile.savedPosts;
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

	// Follow/Unfollow functionality
	async followUser(followerEmail: string, followingId: string): Promise<{ message: string }> {
		// Get follower profile
		const followerProfile = await this.profileModel.findOne({ email: followerEmail });
		if (!followerProfile) {
			throw new NotFoundException('Follower profile not found');
		}

		// Get following profile
		const followingProfile = await this.profileModel.findById(followingId);
		if (!followingProfile) {
			throw new NotFoundException('User to follow not found');
		}

		// Check if user is trying to follow themselves
		if (followerProfile._id.toString() === followingId) {
			throw new ConflictException('Cannot follow yourself');
		}

		// Check if already following
		const existingFollow = await this.followModel.findOne({
			follower: followerProfile._id,
			following: followingId
		});

		if (existingFollow) {
			throw new ConflictException('Already following this user');
		}

		// Create follow relationship
		const follow = new this.followModel({
			follower: followerProfile._id,
			following: followingId
		});

		await follow.save();
		return { message: 'User followed successfully' };
	}

	async unfollowUser(followerEmail: string, followingId: string): Promise<{ message: string }> {
		// Get follower profile
		const followerProfile = await this.profileModel.findOne({ email: followerEmail });
		if (!followerProfile) {
			throw new NotFoundException('Follower profile not found');
		}

		// Remove follow relationship
		const result = await this.followModel.deleteOne({
			follower: followerProfile._id,
			following: followingId
		});

		if (result.deletedCount === 0) {
			throw new NotFoundException('Follow relationship not found');
		}

		return { message: 'User unfollowed successfully' };
	}

	async getFollowCounts(userId: string): Promise<{ followersCount: number; followingCount: number }> {
		const [followersCount, followingCount] = await Promise.all([
			this.followModel.countDocuments({ following: userId }),
			this.followModel.countDocuments({ follower: userId })
		]);

		return { followersCount, followingCount };
	}

	async isFollowing(followerEmail: string, followingId: string): Promise<boolean> {
		const followerProfile = await this.profileModel.findOne({ email: followerEmail });
		if (!followerProfile) {
			return false;
		}

		const follow = await this.followModel.findOne({
			follower: followerProfile._id,
			following: followingId
		});

		return !!follow;
	}

	async getFollowers(userId: string): Promise<AccountProfile[]> {
		const followers = await this.followModel
			.find({ following: userId })
			.populate('follower')
			.exec();

		return followers.map(follow => follow.follower as AccountProfile);
	}

	async getFollowing(userId: string): Promise<AccountProfile[]> {
		const following = await this.followModel
			.find({ follower: userId })
			.populate('following')
			.exec();

		return following.map(follow => follow.following as AccountProfile);
	}

	async getDashboardStats(email: string) {
        // Get user profile
        const profile = await this.profileModel.findOne({ email }).exec();
        if (!profile) {
            throw new NotFoundException('Profile not found');
        }

        // Get user posts
        const userPosts = await this.postModel.find({ author: profile._id }).exec();
        
        // Calculate total likes and comments
        const totalLikes = userPosts.reduce((sum, post) => sum + (post.likes || 0), 0);
        const totalComments = userPosts.reduce((sum, post) => sum + (post.comments?.length || 0), 0);
        
        // Get follow counts
        const [followersCount, followingCount] = await Promise.all([
            this.followModel.countDocuments({ following: profile._id }),
            this.followModel.countDocuments({ follower: profile._id })
        ]);
        
        // Calculate post categories distribution
        const categories = {};
        userPosts.forEach(post => {
            const category = post.category || 'uncategorized';
            categories[category] = (categories[category] || 0) + 1;
        });
        
        // Get post creation timeline (posts per month)
        const timeline = {};
        userPosts.forEach(post => {
            const date = new Date(post.createdAt);
            const monthYearKey = `${date.getFullYear()}-${date.getMonth() + 1}`;
            timeline[monthYearKey] = (timeline[monthYearKey] || 0) + 1;
        });
        
        // Get recent activity (last 5 posts)
        const recentPosts = await this.postModel
            .find({ author: profile._id })
            .sort({ createdAt: -1 })
            .limit(5)
            .exec();
        
        return {
            stats: {
                totalPosts: userPosts.length,
                totalLikes,
                averageLikes: userPosts.length > 0 ? totalLikes / userPosts.length : 0,
                totalComments,
                savedPostsCount: profile.savedPosts?.length || 0,
                followersCount,
                followingCount
            },
            categories,
            timeline,
            recentActivity: recentPosts.map(post => ({
                id: post._id,
                title: post.title,
                likes: post.likes,
                comments: post.comments?.length || 0,
                createdAt: post.createdAt
            }))
        };
    }
}