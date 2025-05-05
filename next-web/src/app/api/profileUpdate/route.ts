// pages/api/updateProfile.js (for pages directory)


// import { auth0 } from "@/lib/auth0";
import { NextRequest, NextResponse } from "next/server";


// async function SSR_request(props: AccountProfile) {
// 	const session = await auth0.getSession();
// 	console.log(session)
// 	console.log('SSR_request', props)
// 	return
// 	const response = await fetch(process.env.NEXT_PUBLIC_DISPATCH_URL+'/editProfile/' || 'https://example.com', {
// 		method: 'POST',
// 		headers: {
// 		  'Content-Type': 'application/json',
// 		},
// 		body: JSON.stringify(props),
// 	});

// 	if (!response.ok) {
// 		throw new Error('Failed to save profile');
// 	}
// }
// import { SSR_request } from '@/lib/server/SSR_request'; // adjust path as needed

export async function POST(req: NextRequest) {
  try {
    // const tempProfile = await req.json();
	console.log(req.body)

    // await SSR_request(tempProfile);

    return NextResponse.json({ message: 'Profile updated successfully' });
  } catch (error) {
    console.error('Server error:', error);
    return NextResponse.json(
      { message: 'Server failed to update profile' },
      { status: 500 }
    );
  }
}
