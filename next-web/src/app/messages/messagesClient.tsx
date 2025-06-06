"use client";

import React from 'react';
import { MessagesList } from '@/components/ui/MessagesList';
import Link from 'next/link';
import { ArrowLeft } from 'lucide-react';

const MessagesClient = () => {  return (
    <div className="container mx-auto px-4 py-10 max-w-4xl">
      <Link href="/posts" className="inline-flex items-center text-primary-600 hover:text-primary-800 mb-6">
        <ArrowLeft className="mr-2 h-4 w-4" /> Back to Posts
      </Link>
      
      <div className="mb-8">
        <h1 className="text-3xl font-bold mb-2">Messages</h1>
        <p className="text-gray-600 dark:text-gray-400">
          Your conversations with other users
        </p>
      </div>
      
      <div className="bg-white dark:bg-gray-900 rounded-lg shadow">
        <React.Suspense fallback={<div className="p-6 text-center">Loading messages...</div>}>
          <MessagesList />
        </React.Suspense>
      </div>
    </div>
  );
};

export default MessagesClient;
