import { auth0 } from "@/lib/auth0";
import { NextResponse } from "next/server";
import axios from "axios";

const DISPATCH_URL = process.env.NEXT_PUBLIC_DISPATCH_URL || 'http://localhost:3333';

export async function GET() {
  try {
    const session = await auth0.getSession();
    if (!session) {
      return NextResponse.json({ error: "Not authenticated" }, { status: 401 });
    }
    
    // Get access token
    const accessToken = await auth0.getAccessToken();
    if (!accessToken || !accessToken.token) {
      return NextResponse.json({ error: "No access token available" }, { status: 401 });
    }
    
    // Fetch profile from backend
    const response = await axios.get(
      `${DISPATCH_URL}/account/getProfile/`,
      {
        headers: {
          'Content-Type': 'application/json',
          'Authorization': `Bearer ${accessToken.token}`,
          'ngrok-skip-browser-warning': '69420'
        },
      }
    );
    
    if (response.status >= 200 && response.status < 300) {
      return NextResponse.json(response.data);
    } else {
      return NextResponse.json(
        { error: "Failed to fetch profile from backend" }, 
        { status: response.status }
      );
    }
  } catch (error) {
    console.error("Error in profile API route:", error);
    return NextResponse.json({ error: "Internal server error" }, { status: 500 });
  }
}
