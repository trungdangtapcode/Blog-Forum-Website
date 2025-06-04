import { Metadata } from 'next';
import ProfilePageClient from './profileClient';

export const metadata: Metadata = {
  title: 'Public Profile | WataBlog',
  description: 'View public profile and posts'
};

export default function ProfilePage({ params }: { params: { id: string } }) {
  return <ProfilePageClient params={params} />;
}
