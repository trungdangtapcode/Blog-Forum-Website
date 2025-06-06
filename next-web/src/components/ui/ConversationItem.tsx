import React, { useEffect } from 'react';
import { Conversation } from '@/utils/messagesApi';
import { formatDistanceToNow } from 'date-fns';
import { Avatar, AvatarFallback, AvatarImage } from '@/components/ui/avatar';
import { Badge } from '@/components/ui/badge';
import { getPublicProfile } from '@/utils/fetchingProfilePublic';

interface ConversationItemProps {
  conversation: Conversation;
  onSelect: (userId: string) => void;
  isSelected: boolean;
  index: number
  setAvtNameHandler: (index: number, avatar: string, name: string) => void;
}

export function ConversationItem({ conversation, onSelect, isSelected,
  index, setAvtNameHandler
 }: ConversationItemProps) {
  const { partnerId, lastMessage, unreadCount } = conversation;
  const [partnerName, setPartnerName] = React.useState<string | null>(null);
  const [partnerAvatar, setPartnerAvatar] = React.useState<string | null>(null);

  useEffect(()=>{
    const fetchProfile = async () => {
      const profile = await getPublicProfile(partnerId);
      if (profile) {
        setPartnerName(profile.fullName || null);
        setPartnerAvatar(profile.avatar || null);
        setAvtNameHandler(index, profile.avatar || '/default-avatar.png', profile.fullName || 'Unknown User');
      } else {
        setPartnerName('Unknown User');
        setPartnerAvatar(null);
      }
    }
    fetchProfile();
  }, [])
  console.log('conversation:',conversation)
  
  return (
    <div
      className={`p-3 border-b border-gray-100 hover:bg-gray-50 cursor-pointer flex items-center ${
        isSelected ? 'bg-gray-100' : ''
      }`}
      onClick={() => onSelect(partnerId)}
    >
      <Avatar className="h-10 w-10 mr-3">
        <AvatarImage src={partnerAvatar ?? '/default-avatar.png'} />
        <AvatarFallback className="bg-primary-600 text-white">
          {partnerName?.charAt(0).toUpperCase() || 'U'}
        </AvatarFallback>
      </Avatar>
      
      <div className="flex-grow overflow-hidden">
        <div className="flex justify-between items-center">
          <h4 className="font-medium truncate">{partnerName || 'Unknown User'}</h4>
          <span className="text-xs text-gray-500">
            {formatDistanceToNow(new Date(lastMessage.createdAt), { addSuffix: true })}
          </span>
        </div>
        
        <div className="flex justify-between items-center mt-1">
          <p className="text-sm text-gray-600 truncate max-w-[180px]">
            {lastMessage.content}
          </p>
          
          {unreadCount > 0 && (
            <Badge
              variant="secondary"
              className="ml-2 bg-secondary-600 text-white"
            >
              {unreadCount}
            </Badge>
          )}
        </div>
      </div>
    </div>
  );
}
