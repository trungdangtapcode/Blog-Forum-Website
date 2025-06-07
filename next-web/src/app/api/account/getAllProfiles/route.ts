import { NextResponse } from "next/server";
import { auth0 } from "@/lib/auth0";
import { DISPATCH_URL } from "@/app/config";
import axios from "axios";

export async function GET() {
  try {
    const session = await auth0.getSession();
    if (!session) {
      return NextResponse.json({ error: "Not authenticated" }, { status: 401 });
    }
    
    const accessToken = (await auth0.getAccessToken()).token;

    // Check if user is admin
    const profileResponse = await axios.get(
      `${DISPATCH_URL}/account/getProfile/`,
      {
        headers: {
          'Authorization': `Bearer ${accessToken}`,
          'ngrok-skip-browser-warning': '69420'
        },
      }
    );
    
    const userProfile = profileResponse.data;
    
    if (!userProfile.isAdmin) {
      return NextResponse.json(
        { error: "Forbidden - Admin access required" },
        { status: 403 }
      );
    }
    
    // Fetch all profiles from backend
    const response = await axios.get(
      `${DISPATCH_URL}/account/getAllProfiles/`,
      {
        headers: {
          'Authorization': `Bearer ${accessToken}`,
        },
      }
    );
    
    return NextResponse.json(response.data);
  } catch (error) {
    console.error('Error fetching all profiles:', error);
    return NextResponse.json(
      { error: "Internal server error" },
      { status: 500 }
    );
  }
}
