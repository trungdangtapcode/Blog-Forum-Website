import { auth0 } from "@/lib/auth0";
import { DISPATCH_URL } from "@/lib/config";
import axios from "axios";

// Force dynamic rendering for utilities that use auth
export const dynamic = "force-dynamic";

export async function getDashboardStats() {
  try {
    const token = (await auth0.getAccessToken()).token;
    if (!token) {
      throw new Error('Session not found');
    }

    console.log('Token:', token);
    const response = await axios.get(
      `${DISPATCH_URL}/account/dashboard`,
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
    
    // Return default stats if API call fails
    return {
      stats: {
        totalPosts: 0,
        totalLikes: 0,
        averageLikes: 0,
        totalComments: 0,
        savedPostsCount: 0,
        followersCount: 0,
        followingCount: 0
      },
      categories: {},
      timeline: {},
      recentActivity: []
    };
  } catch (error) {
    console.error('Error fetching dashboard stats:', error);
    // Return default stats if API call fails
    return {
      stats: {
        totalPosts: 0,
        totalLikes: 0,
        averageLikes: 0,
        totalComments: 0,
        savedPostsCount: 0,
        followersCount: 0,
        followingCount: 0
      },
      categories: {},
      timeline: {},
      recentActivity: []
    };
  }
}
