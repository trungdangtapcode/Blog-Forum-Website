import { auth0Client } from "@/lib/auth0-client";
import axios from "axios";

// Environment variable
const DISPATCH_URL = process.env.NEXT_PUBLIC_DISPATCH_URL || 'http://localhost:3333';

export interface AuthorInfo {
  _id: string;
  fullName: string;
  avatar?: string;
}

export interface Comment {
  _id: string;
  content: string;
  author: AuthorInfo;
  post: string;
  upvotes: number;
  downvotes: number;
  parentComment?: string;
  replies?: Comment[];
  createdAt: Date;
  updatedAt: Date;
}

export interface CreateCommentInput {
  content: string;
  post: string;
  parentComment?: string;
}

export async function getCommentsByPostId(postId: string) {
  try {
    const response = await axios.get(
      `${DISPATCH_URL}/post/comment/post/${postId}`
    );
    
    if (response.status >= 200 && response.status < 300) {
      return response.data;
    }
    return [];
  } catch (error) {
    console.error(`Error fetching comments for post ${postId}:`, error);
    return [];
  }
}

export async function createComment(commentData: CreateCommentInput) {
  const token = await auth0Client.getToken();
  if (!token) {
    throw new Error('Session not found');
  }  try {
    const response = await axios.post(
      `${DISPATCH_URL}/post/comment/create`,
      commentData,
      {
        headers: {
          'Content-Type': 'application/json',
          'Authorization': `Bearer ${token}`,
        },
      }
    );
    
    if (response.status >= 200 && response.status < 300) {
      return response.data;
    }
    throw new Error('Failed to create comment');
  } catch (error) {
    console.error('Error creating comment:', error);
    throw error;
  }
}

export async function deleteComment(commentId: string) {
  const token = await auth0Client.getToken();
  if (!token) {
    throw new Error('Session not found');
  }

  try {
    const response = await axios.delete(
      `${DISPATCH_URL}/post/comment/${commentId}`,
      {
        headers: {
          'Content-Type': 'application/json',
          'Authorization': `Bearer ${token}`,
        },
      }
    );
    
    if (response.status >= 200 && response.status < 300) {
      return response.data;
    }
    throw new Error('Failed to delete comment');  } catch (error) {
    console.error('Error updating comment:', error);
    throw error;
  }
}

export async function voteComment(commentId: string, action: 'upvote' | 'downvote') {
  try {
    // Always get a fresh token
    const token = await auth0Client.getToken();
    if (!token) {
      throw new Error('Session not found');
    }

    // Use a timestamp to prevent caching
    const timestamp = new Date().getTime();
    const response = await axios.post(
      `${DISPATCH_URL}/post/comment/vote?_t=${timestamp}`,
      { commentId, action },
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
    throw new Error(`Failed to ${action} comment`);
  } catch (error) {
    console.error(`Error voting on comment:`, 
      error instanceof Error ? error.message : 'Unknown error');
    
    // Check if it's a 401 error and handle it appropriately
    if (axios.isAxiosError(error) && error.response?.status === 401) {
      console.log('Authentication error when voting - token may be invalid');
    }
    
    throw error;
  }
}

export async function getUserCommentVote(commentId: string) {
  try {
    // Attempt to get a fresh token each time to avoid stale tokens
    const token = await auth0Client.getToken();
    if (!token) {
      console.log('No authentication token available');
      return null; // Not authenticated, return null without making API call
    }

    // Use a timestamp to prevent caching
    const timestamp = new Date().getTime();
    const response = await axios.get(
      `${DISPATCH_URL}/post/comment/vote/${commentId}?_t=${timestamp}`,
      {
        headers: {
          'Authorization': `Bearer ${token}`,
          // Add cache control headers to prevent caching
          'Cache-Control': 'no-cache, no-store, must-revalidate',
          'Pragma': 'no-cache',
          'Expires': '0'
        },
      }
    );
    
    if (response.status >= 200 && response.status < 300) {
      return response.data;
    }
    return null;
  } catch (error) {
    // Log the error without exposing the token
    console.error('Error getting user vote:', 
      error instanceof Error ? error.message : 'Unknown error');
    
    // Check if it's a 401 error and handle it appropriately
    if (axios.isAxiosError(error) && error.response?.status === 401) {
      console.log('Authentication error when checking vote - token may be invalid');
      // We could try to force a token refresh here if needed
    }
    
    return null; // Return null on error instead of propagating the error
  }
}

export async function updateComment(commentId: string, content: string) {
  const token = await auth0Client.getToken();
  if (!token) {
    throw new Error('Session not found');
  }

  try {
    const response = await axios.put(
      `${DISPATCH_URL}/post/comment/${commentId}`,
      { content },
      {
        headers: {
          'Content-Type': 'application/json',
          'Authorization': `Bearer ${token}`,
        },
      }
    );
    
    if (response.status >= 200 && response.status < 300) {
      return response.data;
    }
    throw new Error('Failed to update comment');
  } catch (error) {
    console.error('Error updating comment:', error);
    throw error;
  }
}
