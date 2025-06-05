import React from 'react';
import { formatDistanceToNow } from 'date-fns';
import { Notification } from '@/utils/notificationsApi';
import { Button } from '@/components/ui/button';
import { cn } from '@/lib/utils';
import { Check, Trash2 } from 'lucide-react';
import Link from 'next/link';
import { Avatar, AvatarFallback, AvatarImage } from '@/components/ui/avatar';

interface NotificationItemProps {
  notification: Notification;
  onMarkAsRead: (id: string) => void;
  onDelete: (id: string) => void;
}

export function NotificationItem({ notification, onMarkAsRead, onDelete }: NotificationItemProps) {
  const isNewPost = notification.type === 'new-post';
  const isFollow = notification.type === 'follow';
  const isLike = notification.type === 'like';
  const isComment = notification.type === 'comment';

  const getNotificationContent = () => {
    return (
      <div className="flex items-start gap-3 w-full">
        <Avatar className="h-8 w-8">
          <AvatarImage 
            src={notification.senderId?.avatar} 
            alt={notification.senderId?.fullName || 'User'}
          />
          <AvatarFallback>
            {(notification.senderId?.fullName?.charAt(0) || 'U').toUpperCase()}
          </AvatarFallback>
        </Avatar>
        
        <div className="flex-1">
          <div className="font-medium text-sm">
            {notification.message}
          </div>
          <div className="text-xs text-muted-foreground">
            {formatDistanceToNow(new Date(notification.createdAt), { addSuffix: true })}
          </div>
        </div>
      </div>
    );
  };

  return (
    <div className={cn(
      "p-3 border-b border-gray-100 flex items-center justify-between",
      !notification.read ? "bg-blue-50" : ""
    )}>
      {notification.postId ? (
        <Link 
          href={`/posts/${notification.postId}`} 
          className="w-full"
          onClick={() => {
            if (!notification.read) {
              onMarkAsRead(notification._id);
            }
          }}
        >
          {getNotificationContent()}
        </Link>
      ) : (
        <div className="w-full">
          {getNotificationContent()}
        </div>
      )}
      
      <div className="flex items-center gap-1">
        {!notification.read && (
          <Button
            variant="ghost"
            size="icon"
            className="h-8 w-8 text-blue-500 hover:text-blue-700"
            onClick={() => onMarkAsRead(notification._id)}
            title="Mark as read"
          >
            <Check className="h-4 w-4" />
          </Button>
        )}
        <Button
          variant="ghost"
          size="icon"
          className="h-8 w-8 text-red-500 hover:text-red-700"
          onClick={() => onDelete(notification._id)}
          title="Delete notification"
        >
          <Trash2 className="h-4 w-4" />
        </Button>
      </div>
    </div>
  );
}
