import { auth0 } from "@/lib/auth0";
import { NextResponse } from "next/server";

export async function GET() {
  try {
    const session = await auth0.getAccessToken();
    if (!session) {
      return NextResponse.json({ error: "Not authenticated" }, { status: 401 });
    }
    
    return NextResponse.json({ token: session.token });
  } catch (error) {
    console.error("Error in token API route:", error);
    return NextResponse.json({ error: "Internal server error" }, { status: 500 });
  }
}
