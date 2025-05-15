import PostDetailClient from "./pageClient"; // Adjust the import path as needed

// /posts/[id]/page.tsx
export default async function PostDetail({ params }: { params: { id: string } }) {
  // Fetch post data on the server using the id from params

  return (
    <>
      <PostDetailClient params={params} />
    </>
  );
}
