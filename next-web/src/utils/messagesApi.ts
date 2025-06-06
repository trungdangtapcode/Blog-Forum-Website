import { apiRequest } from './apiUtils';

export interface Message {
  _id: string;
  sender: string;
  senderName?: string;
  senderAvatar?: string;
  receiver: string;
  content: string;
  read: boolean;
  createdAt: string;
  updatedAt: string;
}

export interface Conversation {
  partnerId: string;
  partnerName?: string;
  partnerAvatar?: string;
  lastMessage: Message;
  unreadCount: number;
}

// Fetch all conversations for the current user
export const fetchConversations = async (): Promise<Conversation[]> => {
  const response = await apiRequest<Conversation[]>('/messages/conversations', {
    method: 'GET',
  });
  return response;
};

// Fetch conversation messages with a specific user
export const fetchConversation = async (userId: string, limit = 20, offset = 0): Promise<Message[]> => {
  const response = await apiRequest<Message[]>('/messages/conversation', {
    method: 'POST',
    headers: {
      'Content-Type': 'application/json',
    },
    body: JSON.stringify({ userId, limit, offset }),
  });
  return response;
};

// Send a new message
export const sendMessage = async (receiverId: string, content: string): Promise<Message> => {
  if (!receiverId) {
    throw new Error('Receiver ID is required');
  }
  
  if (!content || content.trim() === '') {
    throw new Error('Message content cannot be empty');
  }
  
  try {
    console.log('Sending message to:', receiverId, 'Content:', content);
    
    const response = await apiRequest<Message>('/messages', {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
      },
      body: JSON.stringify({ receiver: receiverId, content }),
    });
    
    return response;
  } catch (error) {
    console.error('Error in sendMessage:', error);
    throw error;
  }
};

// Mark all messages from a specific user as read
export const markMessagesAsRead = async (userId: string): Promise<void> => {
  await apiRequest<void>('/messages/read', {
    method: 'PUT',
    headers: {
      'Content-Type': 'application/json',
    },
    body: JSON.stringify({ userId }),
  });
};

// Get count of unread messages across all conversations
export const getUnreadMessagesCount = async (): Promise<number> => {
  const conversations = await fetchConversations();
  return conversations.reduce((total, conversation) => total + conversation.unreadCount, 0);
};
