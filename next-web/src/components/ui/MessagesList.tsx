'use client'; // 👈 REQUIRED when using useSearchParams

import React, { useState, useEffect, useRef } from 'react';
import {
  fetchConversations,
  fetchConversation,
  sendMessage,
  markMessagesAsRead,
  Conversation,
  Message,
} from '@/utils/messagesApi';
import { ConversationItem } from '@/components/ui/ConversationItem';
import { MessageItem } from '@/components/ui/MessageItem';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Loader2, ArrowLeft, Send } from 'lucide-react';
import { useSearchParams } from 'next/navigation';
import { getPublicProfile } from '@/utils/fetchingProfilePublic';

export function MessagesList() {
  const [conversations, setConversations] = useState<Conversation[]>([]);
  const [messages, setMessages] = useState<Message[]>([]);
  const [activeConversation, setActiveConversation] = useState<string | null>(null);
  const [loading, setLoading] = useState(false);
  const [inputMessage, setInputMessage] = useState('');
  const [currentUserId, setCurrentUserId] = useState<string | null>(null);
  const messagesEndRef = useRef<HTMLDivElement>(null);
  const searchParams = useSearchParams();
  
  const [arrayAvatar, setArrayAvatar] = useState<string[]>([]);
  const [arrayName, setArrayName] = useState<string[]>([]);

  const setAvtNameHandler = (index: number, avatar: string, name: string)=>{
    setArrayAvatar((prev) => {
      const newAvatars = [...prev];
      newAvatars[index] = avatar;
      return newAvatars;
    });
    
    setArrayName((prev) => {
      const newNames = [...prev];
      newNames[index] = name;
      return newNames;
    });
  }

  // useEffect(()=>{
  //   const numItems = conversations.length;
  //   const avatars = new Array(numItems).fill('/default-avatar.png');
  //   const names = new Array(numItems).fill('Unknown User');
  //   setArrayAvatar(avatars);
  //   setArrayName(names);
  // },[conversations])

  useEffect(() => {

    // Get the current user ID from localStorage or Auth context
    // This is a placeholder - replace with your actual auth system
    const accountProfileStr = localStorage.getItem('accountProfile');
    let id: string | null = null;
    if (accountProfileStr) {
      try {
        id = JSON.parse(accountProfileStr)._id;
      } catch (e) {
        console.error('Failed to parse accountProfile:', e);
      }
      setCurrentUserId(id);
    } else {
      // fetch from /api/profile to get id
      fetch('/api/account/profile')
        .then(response => response.json())
        .then(data => {
          id = data._id;
          setCurrentUserId(id);
          console.log('Fetched current user ID:', id);
          localStorage.setItem('accountProfile', JSON.stringify(data));
        })
      .catch(error => console.error('Failed to fetch profile:', error));
    }
    // console.log('acccount string:',accountProfileStr)
    // console.error('acccount string:',accountProfileStr)
    

    
    loadConversations();
    
    // Check if there's a userId parameter to open a specific conversation
    const userIdParam = searchParams?.get('userId');
    if (userIdParam) {
      handleSelectConversation(userIdParam,-1);
    }
  }, [searchParams]);
  
  useEffect(() => {
    // Scroll to bottom whenever messages change
    scrollToBottom();
  }, [messages]);

  const scrollToBottom = () => {
    messagesEndRef.current?.scrollIntoView({ behavior: 'smooth' });
  };

  const loadConversations = async () => {
    setLoading(true);
    try {
      const data = await fetchConversations();
      setConversations(data);
      const numItems = conversations.length;
      const avatars = new Array(numItems).fill('/default-avatar.png');
      const names = new Array(numItems).fill('Unknown User');
      setArrayAvatar(avatars);
      setArrayName(names);
    } catch (error) {
      console.error('Failed to load conversations:', error);
    } finally {
      setLoading(false);
    }
  };

  const [currentAvatar, setCurrentAvatar] = useState<string>("");
  const [currentName, setCurrentName] = useState<string>("");
  const handleSelectConversation = async (userId: string, index: number) => {
    setActiveConversation(userId);
    setLoading(true);
    try {
      if (index!=-1){
        // console.log('message current index:',index);
        setCurrentAvatar(arrayAvatar[index] || '/default-avatar.png');
        setCurrentName(arrayName[index] || 'Unknown User');
      } else {
        const profile = await getPublicProfile(userId);
        // console.log('message your profile:', profile)
        setCurrentAvatar(profile.avatar || '/default-avatar.png');
        setCurrentName(profile.fullName || 'Unknown User');
      }
      const data = await fetchConversation(userId);
      setMessages(data);
      // Mark messages as read when opening conversation
      await markMessagesAsRead(userId);
      // Update the unread count in the conversations list
      setConversations((prevConversations) =>
        prevConversations.map((conv) =>
        conv.partnerId === userId ? { ...conv, unreadCount: 0 } : conv
        )
      );
    } catch (error) {
      console.error('Failed to load conversation messages:', error);
    } finally {
      setLoading(false);
    }
  };

  const handleSendMessage = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!inputMessage.trim() || !activeConversation) return;

    try {
      const newMessage = await sendMessage(activeConversation, inputMessage);
      setMessages((prevMessages) => [...prevMessages, newMessage]);
      setInputMessage('');
      
      // Update the conversations list with the new message
      setConversations((prevConversations) =>
        prevConversations.map((conv) => {
          if (conv.partnerId === activeConversation) {
            return {
              ...conv,
              lastMessage: newMessage,
            };
          }
          return conv;
        })
      );
    } catch (error) {
      console.error('Failed to send message:', error);
    }
  };

  const getActivePartnerName = () => {
    if (!activeConversation) return '';
    const conversation = conversations.find(c => c.partnerId === activeConversation);
    return conversation?.partnerName || 'Chat';
  };

  if (loading && conversations.length === 0) {
    return (
      <div className="py-20 flex items-center justify-center">
        <Loader2 className="h-8 w-8 animate-spin text-primary-500" />
      </div>
    );
  }


  return (
    <div className="messages-container w-full h-[500px] flex flex-col">
      {!activeConversation ? (
        // Conversations list view
        <div className="conversations-list max-h-[500px] overflow-y-auto">
          <div className="p-3 border-b border-gray-100 sticky top-0 bg-white z-10">
            <h3 className="font-medium">Messages</h3>
          </div>
          
          {conversations.length > 0 ? (
            conversations.map((conversation, index) => (
              <ConversationItem
                setAvtNameHandler = {setAvtNameHandler}
                index = {index}
                key={conversation.partnerId}
                conversation={conversation}
                onSelect={() => handleSelectConversation(conversation.partnerId, index)}
                isSelected={activeConversation === conversation.partnerId}
              />
            ))
          ) : (
            <div className="py-10 text-center text-gray-500">
              <p>No conversations yet</p>
            </div>
          )}
        </div>
      ) : (
        // Active conversation view
        <div className="flex flex-col h-full">
          <div className="p-3 border-b border-gray-100 sticky top-0 bg-white z-10 flex items-center">
            <Button 
              variant="ghost" 
              size="sm" 
              onClick={() => setActiveConversation(null)}
              className="mr-2 p-0 h-8 w-8"
            >
              <ArrowLeft className="h-4 w-4" />
            </Button>
            <h3 className="font-medium">{getActivePartnerName()}</h3>
          </div>
          
          <div className="flex-grow overflow-y-auto p-4">
            {loading ? (
              <div className="py-10 flex items-center justify-center">
                <Loader2 className="h-6 w-6 animate-spin text-primary-500" />
              </div>
            ) : messages.length > 0 ? (
              <>
                {messages.map((message) => (
                  <MessageItem
                    key={message._id}
                    message={message}
                    avatar={currentAvatar || '/default-avatar.png'}
                    name={currentName || 'Unknown User'}
                    isCurrentUser={message.sender === currentUserId}
                  />
                ))}
                <div ref={messagesEndRef} />
              </>
            ) : (
              <div className="py-10 text-center text-gray-500">
                <p>No messages in this conversation yet</p>
                <p className="text-sm mt-2">Be the first to say hello!</p>
              </div>
            )}
          </div>
          
          <div className="p-3 border-t border-gray-100">
            <form onSubmit={handleSendMessage} className="flex items-center gap-2">
              <Input
                type="text"
                placeholder="Type a message..."
                value={inputMessage}
                onChange={(e) => setInputMessage(e.target.value)}
                className="flex-grow"
              />
              <Button 
                type="submit" 
                size="sm"
                disabled={!inputMessage.trim()}
                className="bg-primary-600 hover:bg-primary-700"
              >
                <Send className="h-4 w-4" />
              </Button>
            </form>
          </div>
        </div>
      )}
    </div>
  );
}
