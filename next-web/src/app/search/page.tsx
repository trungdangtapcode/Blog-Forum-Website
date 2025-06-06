import React, { Suspense } from 'react';
import SearchClient from './searchClient';

export default function SearchPage() {
  return (
    <Suspense fallback={<div className="container mx-auto px-4 py-10 text-center">Loading search results...</div>}>
      <SearchClient />
    </Suspense>
  );
}
