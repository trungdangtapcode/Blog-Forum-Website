import { NextRequest, NextResponse } from 'next/server';

export async function POST(request: NextRequest) {
  const backendUrl = process.env.NEXT_PUBLIC_DISPATCH_URL || 'http://localhost:3010';
  // return backendUrl
  const searchBody = await request.json();
  console.log('searchBody:',searchBody)
  // return NextResponse.json({ data:backendUrl });

  try {
    // Forward the request to the backend search API
    const response = await fetch(`${backendUrl}/search`, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
        'ngrok-skip-browser-warning': '69420'
      },
      body: JSON.stringify(searchBody),
      cache: 'no-store',
    });

    if (!response.ok) {
      const error = await response.text();
      return NextResponse.json({ error }, { status: response.status });
    }

    const data = await response.json();
    return NextResponse.json(data);
  } catch (error) {
    // console.error('Search API error:', error);

    return NextResponse.json(
      { error: `Failed to connect to search service ${error}` },
      { status: 500 }
    );
  }
}
