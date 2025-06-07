import { auth0Client } from "@/lib/auth0-client";
import { DISPATCH_URL } from "@/lib/config";
import axios from "axios";

export interface Author {
  _id: string;
  name?: string;
  email?: string;
  avatar?: string;
  fullName?: string;
}

export interface Post {
  _id: string;
  title: string;
  content: string;
  author: string | Author;
  likes: number;
  comments: string[];
  category: string;
  summary?: string;
  createdAt: string | Date;
  updatedAt: string | Date;
  isVerified: boolean;
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
      `${DISPATCH_URL}/post/get`,
      {
        headers: {
          'ngrok-skip-browser-warning': '69420'
        }
      }
    );
    
    if (response.status >= 200 && response.status < 300) {
      // console.log('Response:', response);
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
      `${DISPATCH_URL}/post/get/${id}`,
      {
        headers: {
          'ngrok-skip-browser-warning': '69420'
        }
      }
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
  // console.log('postData:', postData)
  // console.log('DISPATCH_URL:', DISPATCH_URL)
  // console.log('token:', token)
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

export async function updatePost(id: string, postData: Partial<CreatePostInput>) {
  const token = await auth0Client.getToken();
  if (!token) {
    throw new Error('Session not found');
  }
  
  try {
    const response = await axios.put(
      `${DISPATCH_URL}/post/update/${id}`,
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
    throw new Error('Failed to update post');
  } catch (error) {
    console.error('Error updating post:', error);
    throw error;
  }
}

export async function isPostAuthor(postId: string): Promise<boolean> {
  // Check if postId is valid
  if (!postId) {
    console.error('Invalid post ID provided to isPostAuthor:', postId);
    return false;
  }

  try {
    const token = await auth0Client.getToken();
    if (!token) {
      console.warn('No authentication token available, user is not logged in');
      return false; // Not logged in, definitely not the author
    }
    
    // console.log(`Checking author for post: ${postId}`);
    // console.log(`API endpoint: ${DISPATCH_URL}/post/isauthor/${postId}`);
    
    const response = await axios.get(
      `${DISPATCH_URL}/post/isauthor/${postId}`,
      {
        headers: {
          'Content-Type': 'application/json',
          'Authorization': `Bearer ${token}`,
          'ngrok-skip-browser-warning': '69420'
        },
      }
    );
    
    // console.log('Author check response:', response.data);
    
    if (response.status >= 200 && response.status < 300) {
      return response.data.isAuthor;
    }
    return false;
  } catch (error) {
    console.error('Error checking if user is post author:', error);
    if (axios.isAxiosError(error)) {
      console.error('Request failed with status:', error.response?.status);
      console.error('Response data:', error.response?.data);
    }
    return false;
  } 
}

export async function likePost(postId: string, action: 'like' | 'dislike') {
  try {
    const token = await auth0Client.getToken();
    if (!token) {
      throw new Error('Session not found');
    }

    // Add timestamp to prevent caching issues
    const timestamp = new Date().getTime();
    const response = await axios.put(
      `${DISPATCH_URL}/post/like?_t=${timestamp}`,
      { post: postId, action },
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
    throw new Error('Failed to like post');
  } catch (error) {
    // Log error without exposing the token
    console.error('Error liking post:', 
      error instanceof Error ? error.message : 'Unknown error');
    
    // Check for 401 Unauthorized error
    if (axios.isAxiosError(error) && error.response?.status === 401) {
      console.error('Authentication error when liking post - token may be invalid');
    }
    
    throw error;
  }
}

export async function unlikePost(postId: string) {
  try {
    const token = await auth0Client.getToken();
    if (!token) {
      throw new Error('Session not found');
    }

    // Add timestamp to prevent caching issues
    const timestamp = new Date().getTime();
    const response = await axios.delete(
      `${DISPATCH_URL}/post/like?_t=${timestamp}`,
      {
        headers: {
          'Content-Type': 'application/json',
          'Authorization': `Bearer ${token}`,
          'Cache-Control': 'no-cache, no-store, must-revalidate',
          'Pragma': 'no-cache',
          'Expires': '0'
        },
        data: { post: postId },
      }
    );
    
    if (response.status >= 200 && response.status < 300) {
      return response.data;
    }
    throw new Error('Failed to unlike post');
  } catch (error) {
    // Log error without exposing the token
    console.error('Error unliking post:', 
      error instanceof Error ? error.message : 'Unknown error');
    
    // Check for 401 Unauthorized error
    if (axios.isAxiosError(error) && error.response?.status === 401) {
      console.error('Authentication error when unliking post - token may be invalid');
    }
    
    throw error;
  }
}

export async function isPostLiked(postId: string) {
  const token = await auth0Client.getToken();
  try {
    if (!token) {
      return null;
    }

    // Add timestamp to prevent caching issues
    const timestamp = new Date().getTime();
    const response = await axios.post(
      `${DISPATCH_URL}/post/isliked?_t=${timestamp}`,
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
    // Log error without exposing the token
    console.error('Error checking if post is liked:', 
      error instanceof Error ? error.message : 'Unknown error');
    
    // Check for 401 Unauthorized error
    if (axios.isAxiosError(error) && error.response?.status === 401) {
      console.error('Authentication error when checking post like status - token may be invalid');
      console.error('Token =',token);
      console.error('Blog Id =',postId);
    }
    
    return null;
  }
}

export async function getPostsByAuthor(authorId: string) {
  try {
    // Add timestamp to prevent caching issues
    const timestamp = new Date().getTime();
    const response = await axios.get(
      `${DISPATCH_URL}/post/byauthor/${authorId}?_t=${timestamp}`,
      {
        headers: {
          'Cache-Control': 'no-cache, no-store, must-revalidate',
          'Pragma': 'no-cache',
          'Expires': '0',
          'ngrok-skip-browser-warning': '69420'
        }
      }
    );
    
    if (response.status >= 200 && response.status < 300) {
      return response.data;
    }
    return [];  } catch (error) {
    console.error('Error fetching posts by author:', error);
    return [];
  }
}

// Follow functionality
export async function followUser(userId: string) {
  try {
    const token = await auth0Client.getToken();
    const response = await axios.post(
      `${DISPATCH_URL}/account/follow/${userId}`,
      {},
      {
        headers: {
          Authorization: `Bearer ${token}`,
        },
      }
    );
    
    if (response.status >= 200 && response.status < 300) {
      return response.data;
    }
    throw new Error('Failed to follow user');
  } catch (error) {
    console.error('Error following user:', error);
    throw error;
  }
}

export async function unfollowUser(userId: string) {
  try {
    const token = await auth0Client.getToken();
    const response = await axios.delete(
      `${DISPATCH_URL}/account/follow/${userId}`,
      {
        headers: {
          Authorization: `Bearer ${token}`,
        },
      }
    );
    
    if (response.status >= 200 && response.status < 300) {
      return response.data;
    }
    throw new Error('Failed to unfollow user');
  } catch (error) {
    console.error('Error unfollowing user:', error);
    throw error;
  }
}

export async function getFollowCounts(userId: string) {
  try {
    const response = await axios.get(
      `${DISPATCH_URL}/account/follow/counts/${userId}`,
      {
        headers: {
          'ngrok-skip-browser-warning': '69420'
        }
      }
    );
    
    if (response.status >= 200 && response.status < 300) {
      return response.data;
    }
    return { followersCount: 0, followingCount: 0 };
  } catch (error) {
    console.error('Error fetching follow counts:', error);
    return { followersCount: 0, followingCount: 0 };
  }
}

export async function isFollowing(userId: string) {
  try {
    const token = await auth0Client.getToken();
    const response = await axios.get(
      `${DISPATCH_URL}/account/follow/status/${userId}`,
      {
        headers: {
          'Authorization': `Bearer ${token}`,
          'ngrok-skip-browser-warning': '69420'
        },
      }
    );
    
    if (response.status >= 200 && response.status < 300) {
      return response.data.isFollowing;
    }
    return false;
  } catch (error) {
    console.error('Error checking follow status:', error);
    return false;
  }
}

export async function getFollowers(userId: string) {
  try {
    const response = await axios.get(
      `${DISPATCH_URL}/account/followers/${userId}`,
      {
        headers: {
          'ngrok-skip-browser-warning': '69420'
        }
      }
    );
    
    if (response.status >= 200 && response.status < 300) {
      return response.data;
    }
    return [];
  } catch (error) {
    console.error('Error fetching followers:', error);
    return [];
  }
}

export async function getFollowing(userId: string) {
  try {
    const response = await axios.get(
      `${DISPATCH_URL}/account/following/${userId}`,
      {
        headers: {
          'ngrok-skip-browser-warning': '69420'
        }
      }
    );
    
    if (response.status >= 200 && response.status < 300) {
      return response.data;
    }
    return [];
  } catch (error) {
    console.error('Error fetching following:', error);
    return [];
  }
}
