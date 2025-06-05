'use server'

import { auth0 } from "@/lib/auth0";
import axios from 'axios';

export async function SSR_request(props: AccountProfile) {
	try {
		const session = await auth0.getSession();
		if (!session) {
			throw new Error('Session not found');
		}

		const email = session.user.email;
		props.email = email!;
		console.log("📸 AVATAR LENGTH:", props.avatar?.length ?? 'undefined');
		// console.log("📤 Props being sent:", JSON.stringify(props, null, 2));

		// Ensure fallback is applied correctly
		const baseUrl = process.env.NEXT_PUBLIC_DISPATCH_URL || 'https://example.com';
		const endpoint = `${baseUrl}/account/updateProfile/`;

		const response = await axios.post(
			endpoint,
			props,
			{
				headers: {
					'Content-Type': 'application/json',
				},
			}
		);

		console.log('✅ Response status:', response.status);
		console.log('📦 Response data:', response.data);

		return response.data;
	} catch (error: unknown) {
		if (axios.isAxiosError(error)) {
			if (error.response) {
				console.error("❌ Axios Error Response:");
				console.error("Status:", error.response.status);
				console.error("Data:", error.response.data);
				console.error("Headers:", error.response.headers);
			} else if (error.request) {
				console.error("📭 No response received:", error.request);
			} else {
				console.error("⚙️ Axios config error:", error.message);
			}
		} else if (error instanceof Error) {
			console.error("⚙️ Non-Axios error:", error.message);
		} else {
			console.error("⚙️ Unknown error:", error);
		}
		throw error; // optional: bubble up
	}
}
