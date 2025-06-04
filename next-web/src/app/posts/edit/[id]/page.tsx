import { Metadata } from 'next';
import EditPostClient from './editClient';

export const metadata: Metadata = {
  title: 'Edit Post | WataBlog',
  description: 'Edit your blog post',
};

export default function EditPostPage({ params }: { params: { id: string } }) {
  return <EditPostClient params={params} />;
}
