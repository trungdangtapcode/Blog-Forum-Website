import type { NextConfig } from "next";

const nextConfig: NextConfig = {
  /* config options here */
  experimental: {
    serverActions: {
      bodySizeLimit: '10mb',
      allowedOrigins: ['*'],
    },
  },
  // Force dynamic rendering for the entire app
  // This allows auth0 to work with cookies across the app
  reactStrictMode: true,
  eslint: {
    ignoreDuringBuilds: true, // 💥 disables ESLint during `next build`
  },
  typescript: {
    ignoreBuildErrors: true, // 💥 Disables type errors at build time
  },
};

export default nextConfig;
