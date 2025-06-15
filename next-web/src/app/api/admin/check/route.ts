import { NextRequest, NextResponse } from 'next/server';
import { auth0 } from '@/lib/auth0';

const DISPATCH_URL = process.env.NEXT_PUBLIC_DISPATCH_URL || 'http://localhost:3333';

// eslint-disable-next-line @typescript-eslint/no-unused-vars
export async function GET(request: NextRequest) {
  try {
    const session = await auth0.getSession();
    if (!session) {
      return NextResponse.json({ isAdmin: false });
    }

    const accessToken = await auth0.getAccessToken();
    if (!accessToken || !accessToken.token) {
      return NextResponse.json({ isAdmin: false });
    }

    // Fetch the user profile from the backend
    const response = await fetch(`${DISPATCH_URL}/account/profile`, {
      method: 'GET',
      headers: {
        'Content-Type': 'application/json',
        'Authorization': `Bearer ${accessToken.token}`,
      },
    });

    if (!response.ok) {
      return NextResponse.json({ isAdmin: false });
    }

    const data = await response.json();
    return NextResponse.json({ isAdmin: !!data.isAdmin });
  } catch (error) {
    console.error('Error checking admin status:', error);
    return NextResponse.json({ isAdmin: false });
  }
}
