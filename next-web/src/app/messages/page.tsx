import { Suspense } from 'react';
import MessagesClient from './messagesClient';

export default function MessagesPage() {
  return (
    <Suspense fallback={<div>Loading messages...</div>}>
      <MessagesClient />
    </Suspense>
  );
}
