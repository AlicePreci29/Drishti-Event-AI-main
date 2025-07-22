/** @type {import('next').NextConfig} */
const nextConfig = {
  env: {
    GEMINI_API_KEY: process.env.GEMINI_API_KEY,
    GOOGLE_API_KEY: process.env.GOOGLE_API_KEY,
  },
  output: 'export',
  images: {
    domains: ['placehold.co'],   // ✅ Your allowed image domains
    unoptimized: true            // ✅ This disables Next.js image optimization
  },
};

module.exports = nextConfig;

  
