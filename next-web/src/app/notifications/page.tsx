import { Suspense } from 'react';
import NotificationsClient from './NotificationsClient';

export default function NotificationsPage() {
  return (
    <Suspense fallback={<div>Loading Notifications...</div>}>
      <NotificationsClient />
    </Suspense>
  );
}
