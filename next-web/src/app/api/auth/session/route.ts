import { auth0 } from "@/lib/auth0";
import { NextResponse } from "next/server";

export async function GET() {
  try {
    const session = await auth0.getSession();
    if (!session) {
      return NextResponse.json({ authenticated: false });
    }
    
    // Only return safe user information
    return NextResponse.json({
      authenticated: true,
      user: {
        email: session.user?.email,
        name: session.user?.name,
        picture: session.user?.picture
      }
    });
  } catch (error) {
    console.error("Error in session API route:", error);
    
    // Handle token expiration
    const err = error as { code?: string; message?: string; cause?: { code?: string } };
    
    if (err?.code === 'ERR_JWT_EXPIRED' || 
        (err?.message && err.message.includes('jwt expired')) ||
        (err?.cause?.code === 'ERR_JWT_EXPIRED')) {
      
      return NextResponse.json({ 
        authenticated: false, 
        error: "Token expired",
        code: "token_expired" 
      }, { status: 401 });
    }
    
    return NextResponse.json({ error: "Internal server error" }, { status: 500 });
  }
}
