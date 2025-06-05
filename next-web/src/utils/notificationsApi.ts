import { DISPATCH_URL } from '@/lib/config';
import { auth0Client } from "@/lib/auth0-client";

export interface Notification {
  _id: string;
  recipient: string;
  type: string; // 'new-post', 'follow', 'like', 'comment'
  message: string;
  postId: string;
  senderId: {
    _id: string;
    fullName: string;
    avatar: string;
  };
  read: boolean;
  createdAt: string;
}

export async function fetchNotifications(): Promise<Notification[]> {  
  try {
    const token = await auth0Client.getToken();
    const response = await fetch(`${DISPATCH_URL}/notifications`, {
      method: 'GET',
      credentials: 'include',
      headers: {
        'Content-Type': 'application/json',
        'Authorization': `Bearer ${token}`,
      },
    });
    
    if (!response.ok) {
      throw new Error(`Failed to fetch notifications: ${response.statusText}`);
    }
    
    return await response.json();
  } catch (error) {
    console.error('Error fetching notifications:', error);
    return [];
  }
}

export async function getUnreadNotificationsCount(): Promise<number> {
  try {
    const token = await auth0Client.getToken();
    const response = await fetch(`${DISPATCH_URL}/notifications/count`, {
      method: 'GET',
      credentials: 'include',
      headers: {
        'Content-Type': 'application/json',
        'Authorization': `Bearer ${token}`,
      },
    });
    
    if (!response.ok) {
      throw new Error(`Failed to fetch notification count: ${response.statusText}`);
    }
    
    const data = await response.json();
    return data.count;
  } catch (error) {
    console.error('Error fetching notification count:', error);
    return 0;
  }
}

export async function markNotificationAsRead(notificationId: string): Promise<void> {
  try {
    const token = await auth0Client.getToken();
    const response = await fetch(`${DISPATCH_URL}/notifications/${notificationId}/read`, {
      method: 'POST',
      credentials: 'include',
      headers: {
        'Content-Type': 'application/json',
        'Authorization': `Bearer ${token}`,
      },
    });
    
    if (!response.ok) {
      throw new Error(`Failed to mark notification as read: ${response.statusText}`);
    }
  } catch (error) {
    console.error('Error marking notification as read:', error);
  }
}

export async function markAllNotificationsAsRead(): Promise<void> {
  try {
    const token = await auth0Client.getToken();
    const response = await fetch(`${DISPATCH_URL}/notifications/read-all`, {
      method: 'POST',
      credentials: 'include',
      headers: {
        'Content-Type': 'application/json',
        'Authorization': `Bearer ${token}`,
      },
    });
    
    if (!response.ok) {
      throw new Error(`Failed to mark all notifications as read: ${response.statusText}`);
    }
  } catch (error) {
    console.error('Error marking all notifications as read:', error);
  }
}

export async function deleteNotification(notificationId: string): Promise<void> {
  try {
    const response = await fetch(`${DISPATCH_URL}/notifications/${notificationId}`, {
      method: 'DELETE',
      credentials: 'include',
      headers: {
        'Content-Type': 'application/json',
      },
    });
    
    if (!response.ok) {
      throw new Error(`Failed to delete notification: ${response.statusText}`);
    }  } catch (error) {
    console.error('Error deleting notification:', error);
  }
}

// Test function to add a notification for any account (no authentication required)
export async function addTestNotification(
  recipientId: string,
  message: string,
  options?: {
    type?: string;
    postId?: string;
    senderId?: string;
  }
): Promise<Notification | null> {
  try {
    const response = await fetch(`${DISPATCH_URL}/notifications/test-add`, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
      },
      body: JSON.stringify({
        recipientId,
        message,
        ...options
      }),
    });
    
    if (!response.ok) {
      throw new Error(`Failed to add test notification: ${response.statusText}`);
    }
    
    const result = await response.json();
    return result.notification;
  } catch (error) {
    console.error('Error adding test notification:', error);
    return null;
  }
}
