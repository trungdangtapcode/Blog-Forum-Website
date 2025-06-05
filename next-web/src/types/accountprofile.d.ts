interface AccountProfile {
	avatar: string;
	email: string;
	fullName: string;
	bio: string;
	age: number;
	location: string;
	occupation: string;
	_id: string;
}

type AccountPublicProfile = Partial<AccountProfile>;