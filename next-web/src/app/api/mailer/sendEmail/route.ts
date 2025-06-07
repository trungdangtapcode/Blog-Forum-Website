import { NextResponse } from "next/server";
import { auth0 } from "@/lib/auth0";
import { DISPATCH_URL } from "@/lib/config";
import axios from "axios";

export async function POST(request: Request) {
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
    
    // Get email details from request body
    const { email, subject, content } = await request.json();
    
    if (!email || !subject || !content) {
      return NextResponse.json(
        { error: "Missing required email parameters" },
        { status: 400 }
      );
    }
    
    // Send email via the mailer service
    const response = await axios.post(
      `${DISPATCH_URL}/mailer/test-email`,
      {
        email,
        subject,
        content
      },
      {
        headers: {
          'Authorization': `Bearer ${accessToken}`,
          'Content-Type': 'application/json',
        },
      }
    );
    
    return NextResponse.json(response.data);
  } catch (error) {
    console.error('Error sending email:', error);
    return NextResponse.json(
      { error: "Internal server error" },
      { status: 500 }
    );
  }
}
