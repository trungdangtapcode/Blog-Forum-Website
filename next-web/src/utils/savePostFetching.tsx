import { auth0Client } from "@/lib/auth0-client";
import { DISPATCH_URL } from "@/lib/config";
import axios from "axios";

export async function savePost(postId: string) {
  try {
    const token = await auth0Client.getToken();
    if (!token) {
      throw new Error('Session not found');
    }

    const timestamp = new Date().getTime();
    const response = await axios.post(
      `${DISPATCH_URL}/post/save?_t=${timestamp}`,
      { post: postId },
      {
        headers: {
          'Content-Type': 'application/json',
          'Authorization': `Bearer ${token}`,
          'Cache-Control': 'no-cache, no-store, must-revalidate',
          'Pragma': 'no-cache',
          'Expires': '0'
        },
      }
    );
    
    if (response.status >= 200 && response.status < 300) {
      return response.data;
    }
    throw new Error('Failed to save post');
  } catch (error) {
    console.error('Error saving post:', 
      error instanceof Error ? error.message : 'Unknown error');
    
    if (axios.isAxiosError(error) && error.response?.status === 401) {
      console.error('Authentication error when saving post - token may be invalid');
    }
    
    throw error;
  }
}

export async function unsavePost(postId: string) {
  try {
    const token = await auth0Client.getToken();
    if (!token) {
      throw new Error('Session not found');
    }


    // const timestamp = new Date().getTime();
    const response = await axios.delete(
      `${DISPATCH_URL}/post/save`,
      {
        headers: {
          'Content-Type': 'application/json',
          'Authorization': `Bearer ${token}`,
          'Cache-Control': 'no-cache, no-store, must-revalidate',
          'Pragma': 'no-cache',
          'Expires': '0'
        },
        data: { post: postId }
      }
    );
    
    if (response.status >= 200 && response.status < 300) {
      return response.data;
    }
    throw new Error('Failed to unsave post');
  } catch (error) {
    console.error('Error unsaving post:', 
      error instanceof Error ? error.message : 'Unknown error');
    
    if (axios.isAxiosError(error) && error.response?.status === 401) {
      console.error('Authentication error when unsaving post - token may be invalid');
    }
    
    throw error;
  }
}

export async function isPostSaved(postId: string) {
  const token = await auth0Client.getToken();
  try {
    if (!token) {
      return null;
    }

    const timestamp = new Date().getTime();
    const response = await axios.post(
      `${DISPATCH_URL}/post/save/check?_t=${timestamp}`,
      { post: postId },
      {
        headers: {
          'Content-Type': 'application/json',
          'Authorization': `Bearer ${token}`,
          'Cache-Control': 'no-cache, no-store, must-revalidate',
          'Pragma': 'no-cache',
          'Expires': '0'
        }
      }
    );
    
    if (response.status >= 200 && response.status < 300) {
      return response.data;
    }
    return null;
  } catch (error) {
    console.error('Error checking if post is saved:', 
      error instanceof Error ? error.message : 'Unknown error');
    
    if (axios.isAxiosError(error) && error.response?.status === 401) {
      console.error('Authentication error when checking post save status - token may be invalid');
    }
    
    return null;
  }
}

export async function getSavedPosts() {
  try {
    const token = await auth0Client.getToken();
    if (!token) {
      throw new Error('Session not found');
    }

    const timestamp = new Date().getTime();
    const response = await axios.get(
      `${DISPATCH_URL}/post/save?_t=${timestamp}`,
      {
        headers: {
          'Content-Type': 'application/json',
          'Authorization': `Bearer ${token}`,
          'Cache-Control': 'no-cache, no-store, must-revalidate',
          'Pragma': 'no-cache',
          'Expires': '0'
        }
      }
    );
    
    if (response.status >= 200 && response.status < 300) {
      return response.data;
    }
    throw new Error('Failed to get saved posts');
  } catch (error) {
    console.error('Error getting saved posts:', 
      error instanceof Error ? error.message : 'Unknown error');
    
    if (axios.isAxiosError(error) && error.response?.status === 401) {
      console.error('Authentication error when fetching saved posts - token may be invalid');
    }
    
    throw error;
  }
}
