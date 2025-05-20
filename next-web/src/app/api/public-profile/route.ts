import { NextResponse } from 'next/server';
import axios from 'axios';

const DISPATCH_URL = process.env.NEXT_PUBLIC_DISPATCH_URL || 'http://localhost:3333';

export async function POST(request: Request) {
  try {
    const { userId } = await request.json();
    
    if (!userId) {
      return NextResponse.json({ error: 'User ID is required' }, { status: 400 });
    }
    
    // Forward the request to the NestJS backend
    const response = await axios.post(
      `${DISPATCH_URL}/account/getPublicProfile/`,
      { userId },
      {
        headers: {
          'Content-Type': 'application/json',
        },
      }
    );
    
    // Return the response from the backend
    return NextResponse.json(response.data);
  } catch (error) {
    console.error('Error fetching public profile:', error);
    return NextResponse.json(
      { error: 'Failed to fetch public profile' }, 
      { status: 500 }
    );
  }
}
