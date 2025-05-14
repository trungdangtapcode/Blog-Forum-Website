import { auth0Client } from "@/lib/auth0-client";
import { DISPATCH_URL } from "@/lib/config";
import axios from "axios";

export interface Post {
  _id: string;
  title: string;
  content: string;
  author: string;
  likes: number;
  dislikes: number;
  comments: string[];
  category: string;
  summary?: string;
  createdAt: Date;
  updatedAt: Date;
}

export interface CreatePostInput {
  title: string;
  content: string;
  category: string;
  summary?: string;
}

export async function getPosts() {
  try {
    const response = await axios.get(
      `${DISPATCH_URL}/post/get`
    );
    
    if (response.status >= 200 && response.status < 300) {
      return response.data;
    }
    return [];
  } catch (error) {
    console.error('Error fetching posts:', error);
    return [];
  }
}

export async function getPostById(id: string) {
  try {
    const response = await axios.get(
      `${DISPATCH_URL}/post/get/${id}`
    );
    
    if (response.status >= 200 && response.status < 300) {
      return response.data;
    }
    return null;
  } catch (error) {
    console.error(`Error fetching post ${id}:`, error);
    return null;
  }
}

export async function createPost(postData: CreatePostInput) {
  const token = await auth0Client.getToken();
  if (!token) {
    throw new Error('Session not found');
  }

  try {
    const response = await axios.post(
      `${process.env.NEXT_PUBLIC_DISPATCH_URL}/post/create` || 'https://example.com',
      postData,
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
    throw new Error('Failed to create post');
  } catch (error) {
    console.error('Error creating post:', error);
    throw error;
  }
}

export async function likePost(postId: string, action: 'like' | 'dislike') {
  const token = await auth0Client.getToken();
  if (!token) {
    throw new Error('Session not found');
  }

  try {
    const response = await axios.put(
      `${process.env.NEXT_PUBLIC_DISPATCH_URL}/post/like` || 'https://example.com',
      { post: postId, action },
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
    throw new Error('Failed to like post');
  } catch (error) {
    console.error('Error liking post:', error);
    throw error;
  }
}

export async function unlikePost(postId: string) {
  const token = await auth0Client.getToken();
  if (!token) {
    throw new Error('Session not found');
  }

  try {
    const response = await axios.delete(
      `${process.env.NEXT_PUBLIC_DISPATCH_URL}/post/like` || 'https://example.com',
      {
        headers: {
          'Content-Type': 'application/json',
          'Authorization': `Bearer ${token}`,
        },
        data: { post: postId },
      }
    );
    
    if (response.status >= 200 && response.status < 300) {
      return response.data;
    }
    throw new Error('Failed to unlike post');
  } catch (error) {
    console.error('Error unliking post:', error);
    throw error;
  }
}

export async function isPostLiked(postId: string) {
  const token = await auth0Client.getToken();
  if (!token) {
    return null;
  }

  try {
    const response = await axios.get(
      `${process.env.NEXT_PUBLIC_DISPATCH_URL}/post/isliked` || 'https://example.com',
      {
        headers: {
          'Content-Type': 'application/json',
          'Authorization': `Bearer ${token}`,
        },
        data: { post: postId },
      }
    );
    
    if (response.status >= 200 && response.status < 300) {
      return response.data;
    }
    return null;
  } catch (error) {
    console.error('Error checking if post is liked:', error);
    return null;
  }
}
