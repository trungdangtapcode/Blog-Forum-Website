interface AccountProfile {
	avatar: string;
	email: string;
	fullName: string;
	bio: string;
	age: number;
	location: string;
	occupation: string;
	_id: string;
	credit: number;
	isVerified?: boolean;
	isAdmin?: boolean;
	savedPosts?: string[];
}

type AccountPublicProfile = Partial<AccountProfile>;