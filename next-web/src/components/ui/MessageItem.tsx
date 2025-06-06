import React from 'react';
import { Message } from '@/utils/messagesApi';
import { formatDistanceToNow } from 'date-fns';
import { Avatar, AvatarFallback, AvatarImage } from '@/components/ui/avatar';
import { cn } from '@/lib/utils';

interface MessageItemProps {
  message: Message;
  isCurrentUser: boolean;
  avatar: string;
  name: string;
}

export function MessageItem({ message, isCurrentUser, avatar, name }: MessageItemProps) {
  return (
    <div
      className={cn(
        "flex w-full mb-4",
        isCurrentUser ? "justify-end" : "justify-start"
      )}
    >
      {!isCurrentUser && (
        <Avatar className="h-8 w-8 mr-2">
          <AvatarImage src={avatar} />
          <AvatarFallback>
            {name?.charAt(0).toUpperCase() || 'U'}
          </AvatarFallback>
        </Avatar>
      )}
      
      <div
        className={cn(
          "max-w-[70%] rounded-lg px-4 py-2",
          isCurrentUser 
            ? "bg-primary-600 text-white" 
            : "bg-gray-100 text-primary-800"
        )}
      >
        <p className="text-sm">{message.content}</p>
        <p className="text-xs mt-1 opacity-70">
          {formatDistanceToNow(new Date(message.createdAt), { addSuffix: true })}
        </p>
      </div>
      
      {isCurrentUser && (
        <Avatar className="h-8 w-8 ml-2">
          <AvatarImage src={message.senderAvatar} />
          <AvatarFallback>
            {message.senderName?.charAt(0).toUpperCase() || 'U'}
          </AvatarFallback>
        </Avatar>
      )}
    </div>
  );
}
