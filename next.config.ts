import type { NextConfig } from 'next';

const nextConfig: NextConfig = {
  // ✅ Export static HTML for Netlify
  output: 'export',

  // ✅ Handle TypeScript and ESLint build errors gracefully
  typescript: {
    ignoreBuildErrors: true,
  },
  eslint: {
    ignoreDuringBuilds: true,
  },

  // ✅ Set up image config for placehold.co and disable optimization
  images: {
    remotePatterns: [
      {
        protocol: 'https',
        hostname: 'placehold.co',
        port: '',
        pathname: '/**',
      },
    ],
    unoptimized: true, // Required for static export
  },

  // ✅ Optional: Ensure static routes work with Netlify (like `/about/` instead of `/about`)
  trailingSlash: true,
};

export default nextConfig;
