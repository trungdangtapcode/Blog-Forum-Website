import React, { useState, useEffect } from 'react';
import {
  fetchNotifications,
  markNotificationAsRead,
  markAllNotificationsAsRead,
  deleteNotification,
  Notification,
} from '@/utils/notificationsApi';
import { NotificationItem } from '@/components/ui/NotificationItem';
import { Button } from '@/components/ui/button';
import { Loader2 } from 'lucide-react';

export function NotificationsList() {
  const [notifications, setNotifications] = useState<Notification[]>([]);
  const [loading, setLoading] = useState(false);

  useEffect(() => {
    loadNotifications();
  }, []);

  const loadNotifications = async () => {
    setLoading(true);
    try {
      const data = await fetchNotifications();
      setNotifications(data);
    } catch (error) {
      console.error('Failed to load notifications:', error);
    } finally {
      setLoading(false);
    }
  };

  const handleMarkAsRead = async (id: string) => {
    try {
      await markNotificationAsRead(id);
      setNotifications((prev) =>
        prev.map((notification) =>
          notification._id === id ? { ...notification, read: true } : notification
        )
      );
    } catch (error) {
      console.error('Failed to mark notification as read:', error);
    }
  };

  const handleMarkAllAsRead = async () => {
    try {
      await markAllNotificationsAsRead();
      setNotifications((prev) =>
        prev.map((notification) => ({ ...notification, read: true }))
      );
    } catch (error) {
      console.error('Failed to mark all notifications as read:', error);
    }
  };

  const handleDelete = async (id: string) => {
    try {
      await deleteNotification(id);
      setNotifications((prev) =>
        prev.filter((notification) => notification._id !== id)
      );
    } catch (error) {
      console.error('Failed to delete notification:', error);
    }
  };

  if (loading) {
    return (
      <div className="py-20 flex items-center justify-center">
        <Loader2 className="h-8 w-8 animate-spin text-primary-500" />
      </div>
    );
  }

  return (
    <div className="notifications-list max-h-[400px] overflow-y-auto">
      {notifications.length > 0 ? (
        <>
          <div className="flex justify-between items-center p-3 border-b border-gray-100 sticky top-0 bg-white z-10">
            <h3 className="font-medium">Notifications</h3>
            <Button 
              variant="ghost" 
              size="sm"
              onClick={handleMarkAllAsRead} 
              disabled={notifications.every((n) => n.read)}
            >
              Mark all as read
            </Button>
          </div>
          {notifications.map((notification) => (
            <NotificationItem
              key={notification._id}
              notification={notification}
              onMarkAsRead={handleMarkAsRead}
              onDelete={handleDelete}
            />
          ))}
        </>
      ) : (
        <div className="py-10 text-center text-gray-500">
          <p>No notifications yet</p>
        </div>
      )}
    </div>
  );
}
