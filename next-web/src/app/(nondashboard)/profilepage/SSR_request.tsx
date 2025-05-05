'use server'

import { auth0 } from "@/lib/auth0";
import axios from 'axios';

export async function SSR_request(props: AccountProfile) {
	const session = await auth0.getSession();
	if (!session) {
		throw new Error('Session not found');
	}
	const email = session.user.email;
	console.log("AVATAR LENGTH:", props.avatar.length);
	props.email = email!;
	const response = await axios.post(
		process.env.NEXT_PUBLIC_DISPATCH_URL + '/account/updateProfile/' || 'https://example.com',
		props,
		{
		  headers: {
			'Content-Type': 'application/json',
		  },
		}
	);
	if (response.status >= 200 && response.status < 300) {
		console.log('Request successful:', response.data);
	}
}