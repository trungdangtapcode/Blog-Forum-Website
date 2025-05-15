import { auth0Client } from "@/lib/auth0-client";
import { DISPATCH_URL } from "@/lib/config";
import axios from "axios";

export interface Post {
  _id: string;
  title: string;
  content: string;
  author: string;
  likes: number;
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
  // const DISPATCH_URL = process.env.NEXT_PUBLIC_DISPATCH_URL || 'https://example.com';
  try {
    const response = await axios.get(
      `${DISPATCH_URL}/post/get`
    );
    
    if (response.status >= 200 && response.status < 300) {
      console.log('Response:', response);
      const fetchedPosts: Post[] = response.data;
      if (fetchedPosts){
        // reverse the list
        fetchedPosts.reverse();
      }
      return response.data;
    }
    return [];
  } catch (error) {
    console.error('Error fetching posts:', error);
    return [];
  }
}

export async function getPostById(id: string) {
  // console.log('id:',id)
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
  console.log('postData:', postData)
  console.log('DISPATCH_URL:', DISPATCH_URL)
  console.log('token:', token)
  try {
    const response = await axios.post(
      `${DISPATCH_URL}/post/create`,
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
      `${DISPATCH_URL}/post/like`,
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
      `${DISPATCH_URL}/post/like`,
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
    // Using POST method instead of GET to ensure body data is sent correctly
    // The controller will still handle it as a GET request on the server side
    const response = await axios.post(
      `${DISPATCH_URL}/post/isliked`,
      { post: postId },
      {
        headers: {
          'Content-Type': 'application/json',
          'Authorization': `Bearer ${token}`,
        }
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
