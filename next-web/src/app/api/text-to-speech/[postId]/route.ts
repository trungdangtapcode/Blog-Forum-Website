import { NextRequest, NextResponse } from "next/server";
import { auth0 } from "@/lib/auth0";
import { DISPATCH_URL } from "@/app/config";
import axios from "axios";
import { AxiosError } from 'axios';

export async function GET(
  request: NextRequest,
  { params }: { params: { postId: string } }
) {
  try {
    const session = await auth0.getSession();
    if (!session) {
      return NextResponse.json({ error: "Not authenticated" }, { status: 401 });
    }
    
    const accessToken = (await auth0.getAccessToken()).token;
    const { postId } = params;
    
    if (!postId) {
      return NextResponse.json({ error: "Post ID is required" }, { status: 400 });
    }

    // Call the text-to-speech endpoint from the dispatch service
    const response = await axios.get(
      `${DISPATCH_URL}/text-to-speech/post/${postId}`,
      {
        headers: {
          'Authorization': `Bearer ${accessToken}`,
          'ngrok-skip-browser-warning': '69420',
        },
        responseType: 'arraybuffer', // Important for handling binary data
      }
    );
    
    // Return the audio data with appropriate headers
    return new NextResponse(response.data, {
      headers: {
        'Content-Type': 'audio/mpeg',
        'Content-Disposition': `attachment; filename="post_${postId}.mp3"`,
      },
    });
    
  } catch (error_any) {
	const error = error_any as AxiosError;
    console.error("Error fetching text-to-speech:", error);
    
    // Check if error response exists and has data
    if (error.response && error.response.data) {
      try {
        // Try to parse error data if it's JSON
        const errorData = JSON.parse(error.response.data.toString());
        return NextResponse.json(
          { error: errorData.message || "Failed to convert post to speech" },
          { status: error.response.status || 500 }
        );
      } catch {
        // If parsing fails, return the raw error message
        return NextResponse.json(
          { error: "Failed to convert post to speech" },
          { status: error.response.status || 500 }
        );
      }
    }
    
    return NextResponse.json(
      { error: error.message || "Unknown error occurred" },
      { status: 500 }
    );
  }
}
