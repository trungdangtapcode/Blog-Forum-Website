import { NextRequest, NextResponse } from 'next/server';
import { auth0 } from '@/lib/auth0';

const DISPATCH_URL = process.env.NEXT_PUBLIC_DISPATCH_URL || 'http://localhost:3333';

export async function GET(
  request: NextRequest,
  context: { params: { orderId: string } }
) {
  try {
    // Await the params to ensure they're fully resolved
    const params = await context.params;
    const orderId = params.orderId;

    const session = await auth0.getSession();
    if (!session) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
    }

    const accessToken = await auth0.getAccessToken();
    if (!accessToken || !accessToken.token) {
      return NextResponse.json({ error: "No access token available" }, { status: 401 });
    }

    const response = await fetch(`${DISPATCH_URL}/payment/check-status/${orderId}`, {
      method: 'GET',
      headers: {
        'Content-Type': 'application/json',
        'Authorization': `Bearer ${accessToken.token}`,
      },
    });

    if (!response.ok) {
      const errorData = await response.json();
      console.log('ErrorData in route check-status:', errorData);
      return NextResponse.json(
        { error: errorData.message || errorData.error || 'Failed to check payment status' },
        { status: response.status }
      );
    }

    const data = await response.json();
    console.log('Payment status data:', data);
    return NextResponse.json(data);
  } catch (error) {
    console.error('Error checking payment status:', error);
    return NextResponse.json(
      { error: error instanceof Error ? error.message : 'Internal server error' },
      { status: 500 }
    );
  }
}
