"use client";

import React, { useState } from 'react';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Textarea } from '@/components/ui/textarea';
import { addTestNotification } from '@/utils/notificationsApi';
import { toast } from 'sonner';

export default function TestNotificationsPage() {
  const [recipientId, setRecipientId] = useState('');
  const [message, setMessage] = useState('');
  const [postId, setPostId] = useState('');
  const [senderId, setSenderId] = useState('');
  const [notificationType, setNotificationType] = useState('test');
  const [loading, setLoading] = useState(false);
  const [result, setResult] = useState<any>(null);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    
    if (!recipientId.trim() || !message.trim()) {
      toast.error('Recipient ID and message are required');
      return;
    }
    
    setLoading(true);
    try {
      const notification = await addTestNotification(
        recipientId,
        message,
        {
          type: notificationType || 'test',
          postId: postId || undefined,
          senderId: senderId || undefined,
        }
      );
      
      if (notification) {
        toast.success('Test notification created successfully');
        setResult(notification);
      } else {
        toast.error('Failed to create test notification');
      }
    } catch (error) {
      toast.error(`Error: ${error.message}`);
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="container mx-auto py-8 max-w-2xl">
      <h1 className="text-3xl font-bold mb-6">Test Notifications</h1>
      <div className="bg-white p-6 rounded-lg shadow">
        <form onSubmit={handleSubmit} className="space-y-4">
          <div className="space-y-2">
            <Label htmlFor="recipientId">Recipient ID (Account ID) *</Label>
            <Input
              id="recipientId"
              value={recipientId}
              onChange={(e) => setRecipientId(e.target.value)}
              placeholder="Enter the account ID to receive the notification"
              required
            />
          </div>
          
          <div className="space-y-2">
            <Label htmlFor="message">Notification Message *</Label>
            <Textarea
              id="message"
              value={message}
              onChange={(e) => setMessage(e.target.value)}
              placeholder="Enter the notification message"
              required
            />
          </div>
          
          <div className="space-y-2">
            <Label htmlFor="notificationType">Notification Type</Label>
            <select
              id="notificationType"
              value={notificationType}
              onChange={(e) => setNotificationType(e.target.value)}
              className="w-full p-2 border rounded"
            >
              <option value="test">test</option>
              <option value="new-post">new-post</option>
              <option value="follow">follow</option>
              <option value="like">like</option>
              <option value="comment">comment</option>
            </select>
          </div>
          
          <div className="space-y-2">
            <Label htmlFor="postId">Post ID (Optional)</Label>
            <Input
              id="postId"
              value={postId}
              onChange={(e) => setPostId(e.target.value)}
              placeholder="Enter the related post ID (if applicable)"
            />
          </div>
          
          <div className="space-y-2">
            <Label htmlFor="senderId">Sender ID (Optional)</Label>
            <Input
              id="senderId"
              value={senderId}
              onChange={(e) => setSenderId(e.target.value)}
              placeholder="Enter the sender's account ID (if applicable)"
            />
          </div>
          
          <Button 
            type="submit" 
            className="w-full"
            disabled={loading}
          >
            {loading ? 'Creating...' : 'Create Test Notification'}
          </Button>
        </form>

        {result && (
          <div className="mt-6">
            <h2 className="text-xl font-semibold mb-2">Notification Created:</h2>
            <pre className="bg-gray-100 p-4 rounded overflow-auto max-h-60">
              {JSON.stringify(result, null, 2)}
            </pre>
          </div>
        )}
        
        <div className="mt-6">
          <h2 className="text-xl font-semibold mb-2">Instructions:</h2>
          <ol className="list-decimal pl-5 space-y-2">
            <li>Enter the recipient account ID (MongoDB ObjectId)</li>
            <li>Enter a notification message</li>
            <li>Select a notification type (optional)</li>
            <li>Enter related post ID if applicable (optional)</li>
            <li>Enter sender account ID if applicable (optional)</li>
            <li>Click "Create Test Notification"</li>
            <li>Check the user notification bell to see if it appears</li>
          </ol>
        </div>
      </div>
    </div>
  );
}
