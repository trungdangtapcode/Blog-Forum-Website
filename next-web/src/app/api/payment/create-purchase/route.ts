import { NextRequest, NextResponse } from 'next/server';
import { auth0 } from '@/lib/auth0';

const DISPATCH_URL = process.env.NEXT_PUBLIC_DISPATCH_URL || 'http://localhost:3333';

export async function POST(request: NextRequest) {
  try {
    const { creditAmount } = await request.json();

    const session = await auth0.getSession();
    if (!session) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
    }

    const accessToken = await auth0.getAccessToken();
    if (!accessToken || !accessToken.token) {
      return NextResponse.json({ error: "No access token available" }, { status: 401 });
    }

    const response = await fetch(`${DISPATCH_URL}/payment/create-credit-purchase`, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
        'Authorization': `Bearer ${accessToken.token}`,
      },
      body: JSON.stringify({ creditAmount }),
    });

    if (!response.ok) {
      const errorData = await response.json();
      return NextResponse.json(
        { error: errorData.message || errorData.error || 'Failed to create credit purchase' },
        { status: response.status }
      );
    }

    const data = await response.json();
    return NextResponse.json(data);
  } catch (error) {
    console.error('Error creating credit purchase:', error);
    return NextResponse.json(
      { error: error instanceof Error ? error.message : 'Internal server error' },
      { status: 500 }
    );
  }
}
