import { auth0 } from "@/lib/auth0";
import { NextResponse } from "next/server";

export async function GET() {
  try {
    // Try to get access token
    const session = await auth0.getAccessToken();
    if (!session) {
      return NextResponse.json({ error: "Not authenticated" }, { status: 401 });
    }
    
    return NextResponse.json({ token: session.token });
  } catch (error) {
    console.error("Error in token API route:", error);
    const err = error as { code?: string; message?: string; cause?: { code?: string } };
    
    // Check if it's a token expiration error
    if (err?.code === 'ERR_JWT_EXPIRED' || 
        (err?.message && err?.message.includes('jwt expired')) || 
        (err?.cause && err?.cause?.code === 'ERR_JWT_EXPIRED')) {
      
      // Return a special status code for expired tokens so client can handle it
      return NextResponse.json({ 
        error: "Token expired", 
        code: "token_expired" 
      }, { status: 401 });
    }
    
    return NextResponse.json({ error: "Internal server error" }, { status: 500 });
  }
}
