import { NextResponse } from "next/server";
import { auth0 } from "@/lib/auth0";
import { DISPATCH_URL } from "@/app/config";
import axios from "axios";

export async function POST(
  request: Request, 
  { params }: { params: { postId: string } }
) {
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
    
    const postId = params.postId;
    
    if (!postId) {
      return NextResponse.json(
        { error: "Missing post ID" },
        { status: 400 }
      );
    }
    
    // Call the backend to unverify post
    const response = await axios.post(
      `${DISPATCH_URL}/post/unverify/${postId}`,
      {},
      {
        headers: {
          'Authorization': `Bearer ${accessToken}`,
          'Content-Type': 'application/json',
        },
      }
    );
    
    return NextResponse.json(response.data);
  } catch (error) {
    console.error('Error unverifying post:', error);
    return NextResponse.json(
      { error: "Internal server error" },
      { status: 500 }
    );
  }
}
