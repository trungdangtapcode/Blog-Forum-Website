// This file sets dynamic rendering for routes that use authentication
export const dynamic = 'force-dynamic';
export const runtime = 'nodejs';

export const DISPATCH_URL = process.env.NEXT_PUBLIC_DISPATCH_URL || 'http://localhost:3000';