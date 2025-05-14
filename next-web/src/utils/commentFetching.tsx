import { auth0 } from "@/lib/auth0";
import axios from "axios";

export interface Comment {
  _id: string;
  content: string;
  author: string;
  post: string;
  createdAt: Date;
  updatedAt: Date;
}

export interface CreateCommentInput {
  content: string;
  postId: string;
}

export async function getCommentsByPostId(postId: string) {
  try {
    const response = await axios.get(
      `${process.env.NEXT_PUBLIC_DISPATCH_URL}/comment/post/${postId}` || 'https://example.com'
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
  const session = await auth0.getAccessToken();
  if (!session) {
    throw new Error('Session not found');
  }
  const token = session.token;

  try {
    const response = await axios.post(
      `${process.env.NEXT_PUBLIC_DISPATCH_URL}/comment/create` || 'https://example.com',
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
  const session = await auth0.getAccessToken();
  if (!session) {
    throw new Error('Session not found');
  }
  const token = session.token;

  try {
    const response = await axios.delete(
      `${process.env.NEXT_PUBLIC_DISPATCH_URL}/comment/${commentId}` || 'https://example.com',
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
    throw new Error('Failed to delete comment');
  } catch (error) {
    console.error('Error deleting comment:', error);
    throw error;
  }
}
