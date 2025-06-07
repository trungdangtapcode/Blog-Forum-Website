import {Body, Controller, Delete, Get, Post, Req, UseFilters, UseGuards, UsePipes, ValidationPipe, Param} from '@nestjs/common';
import { AccountService } from './account.service';
import { CachedAuth0Guard } from './guards/cached-auth0.guard';
import { AuthGuard } from '@nestjs/passport';
import { UpdateProfileDto } from './dto/UpdateProfile.dto';
import { AccountProfile } from './accountProfile.chema';

@Controller('account')
export class AccountController {
	constructor(private AccountService: AccountService) {}
	
	@Get("/getAllProfiles")
	@UseGuards(CachedAuth0Guard)
	async getAllProfiles(@Req() req: Request  & { user: any }) {
		console.log('Get all profiles requested');
		const email = req.user.email;
		
		// Check if user is admin
		const profile = await this.AccountService.getProfile(email);
		if (!profile.isAdmin) {
			return { error: 'Unauthorized - Admin access required' };
		}
		
		// Get all profiles
		return this.AccountService.getAllProfiles();
	}
	
	@Post("/verifyUser/:userId")
	@UseGuards(CachedAuth0Guard)
	async verifyUser(
		@Req() req: Request & { user: any }, 
		@Param('userId') userId: string,
		@Body() body: { isVerified: boolean }
	) {
		console.log(`Verify user requested for user ${userId}`);
		const email = req.user.email;
		
		// Check if user is admin
		const profile = await this.AccountService.getProfile(email);
		if (!profile.isAdmin) {
			return { error: 'Unauthorized - Admin access required' };
		}
		
		// Update user verification status
		return this.AccountService.verifyUser(userId, body.isVerified);
	}
	
	@Get("/test")
	@UseGuards(AuthGuard('auth0'))
	test(){
		console.log(process.env.AUTH0_DOMAIN)
		console.log('Inside Account Controller');
		return {message: "Test"};
	}

	@Post("/updateProfile")
	@UsePipes(new ValidationPipe())
	async updateProfile(@Req() req: Request, @Body() updateProfileDto: UpdateProfileDto) {
		console.log('Inside Account Controller', updateProfileDto);
		const email = updateProfileDto.email;
		console.log(email)
		const message = await this.AccountService.updateProfile(email, updateProfileDto);
		console.log(message)
		return { message: "Test" };
	}

	@Get("/getProfile")
	@UseGuards(CachedAuth0Guard)
	async getProfile(@Req() req: Request  & { user: any }) {
		console.log('Inside Account Controller');
		const email = req.user.email;
		console.log(email)
		const profile = await this.AccountService.getProfile(email);
		return profile;
	}

	@Get("/getPublicProfile/")
	async getPublicProfile(@Body() body: { userId: string }) {
		console.log('Inside Account Controller');
		const profile = await this.AccountService.getPublicProfile(body.userId);
		return profile;
	}
	
	// not need to auth
	@Post("/getPublicProfile/")
	async getPublicProfilePOST(@Body() body: { userId: string }) {
		console.log('Inside Account Controller');
		const profile = await this.AccountService.getPublicProfile(body.userId);
		return profile;
	}
		
	@Get("/savedPosts")
	@UseGuards(CachedAuth0Guard)
	async getSavedPosts(@Req() req: Request & { user: any }) {
		const email = req.user.email;
		return await this.AccountService.getSavedPosts(email);
	}
		
	@Post("/savedPosts")
	@UseGuards(CachedAuth0Guard)
	@UsePipes(new ValidationPipe())
	async addSavedPost(@Req() req: Request & { user: any }, @Body() body: { postId: string }) {
		const email = req.user.email;
		return await this.AccountService.addSavedPost(email, body.postId);
	}
	@Delete("/savedPosts")
	@UseGuards(CachedAuth0Guard)
	@UsePipes(new ValidationPipe())
	async removeSavedPost(@Req() req: Request & { user: any }, @Body() body: { postId: string }) {
		const email = req.user.email;
		return await this.AccountService.removeSavedPost(email, body.postId);
	}

	// Follow endpoints
	@Post("/follow/:userId")
	@UseGuards(CachedAuth0Guard)
	async followUser(@Req() req: Request & { user: any }, @Param('userId') userId: string) {
		const email = req.user.email;
		return await this.AccountService.followUser(email, userId);
	}
	@Delete("/follow/:userId")
	@UseGuards(CachedAuth0Guard)
	async unfollowUser(@Req() req: Request & { user: any }, @Param('userId') userId: string) {
		const email = req.user.email;
		return await this.AccountService.unfollowUser(email, userId);
	}

	@Get("/follow/counts/:userId")
	async getFollowCounts(@Param('userId') userId: string) {
		return await this.AccountService.getFollowCounts(userId);
	}
	@Get("/follow/status/:userId")
	@UseGuards(CachedAuth0Guard)
	async isFollowing(@Req() req: Request & { user: any }, @Param('userId') userId: string) {
		const email = req.user.email;
		const isFollowing = await this.AccountService.isFollowing(email, userId);
		return { isFollowing };
	}

	@Get("/followers/:userId")
	async getFollowersId(@Param('userId') userId: string) {
		return await this.AccountService.getFollowers(userId);
	}

	@Get("/following/:userId")
	async getFollowingId(@Param('userId') userId: string) {
		return await this.AccountService.getFollowing(userId);
	}

	@Get("/dashboard")
	@UseGuards(CachedAuth0Guard)
	async getDashboardStats(@Req() req: Request & { user: any }) {
		const email = req.user.email;
		const profile: AccountProfile = await this.AccountService.getProfile(email);
		const userId = profile._id as string;
		return await this.AccountService.getDashboardStats(email);
	}

	@Get("/following")
	@UseGuards(CachedAuth0Guard)
	async getFollowing(@Req() req: Request & { user: any }) {
		const email = req.user.email;
		const profile: AccountProfile = await this.AccountService.getProfile(email);
		const userId = profile._id as string;
		return this.AccountService.getFollowing(userId);
	}

	@Get("/followers")
	@UseGuards(CachedAuth0Guard)
	async getFollowers(@Req() req: Request & { user: any }) {
		const email = req.user.email;
		const profile: AccountProfile = await this.AccountService.getProfile(email);
		const userId = profile._id as string;
		return this.AccountService.getFollowers(userId);
	}
}