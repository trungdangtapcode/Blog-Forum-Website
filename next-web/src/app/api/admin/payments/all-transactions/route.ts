import { NextRequest, NextResponse } from 'next/server';
import { auth0 } from '@/lib/auth0';

const DISPATCH_URL = process.env.NEXT_PUBLIC_DISPATCH_URL || 'http://localhost:3333';

export async function GET(request: NextRequest) {
  try {
    const session = await auth0.getSession();
    if (!session) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
    }

    const accessToken = await auth0.getAccessToken();
    if (!accessToken || !accessToken.token) {
      return NextResponse.json({ error: "No access token available" }, { status: 401 });
    }

    // Check if the user is an admin
    const profileResponse = await fetch(`${DISPATCH_URL}/account/profile`, {
      method: 'GET',
      headers: {
        'Content-Type': 'application/json',
        'Authorization': `Bearer ${accessToken.token}`,
      },
    });

    if (!profileResponse.ok) {
      return NextResponse.json(
        { error: 'Failed to fetch user profile' },
        { status: profileResponse.status }
      );
    }

    const profile = await profileResponse.json();
    if (!profile.isAdmin) {
      return NextResponse.json(
        { error: 'Admin access required' },
        { status: 403 }
      );
    }

    // Fetch all payment transactions
    const response = await fetch(`${DISPATCH_URL}/payment/admin/all-transactions`, {
      method: 'GET',
      headers: {
        'Content-Type': 'application/json',
        'Authorization': `Bearer ${accessToken.token}`,
      },
    });

    if (!response.ok) {
      const errorData = await response.json();
      return NextResponse.json(
        { error: errorData.message || errorData.error || 'Failed to fetch transactions' },
        { status: response.status }
      );
    }

    const data = await response.json();
    return NextResponse.json(data);
  } catch (error) {
    console.error('Error fetching transactions:', error);
    return NextResponse.json(
      { error: error instanceof Error ? error.message : 'Internal server error' },
      { status: 500 }
    );
  }
}
