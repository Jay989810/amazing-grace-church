import type { NextConfig } from "next";

const nextConfig: NextConfig = {
  // API configuration for large file uploads
  experimental: {
    serverActions: {
      bodySizeLimit: '50mb',
    },
  },

  // Image optimization
  images: {
    remotePatterns: [
      {
        protocol: 'https',
        hostname: 'images.unsplash.com',
        port: '',
        pathname: '/**',
      },
      {
        protocol: 'https',
        hostname: '*.supabase.co',
        port: '',
        pathname: '/storage/v1/object/public/**',
      },
      {
        protocol: 'https',
        hostname: 'amazing-grace-church.s3.eu-north-1.amazonaws.com',
        port: '',
        pathname: '/**',
      },
      {
        protocol: 'https',
        hostname: '*.s3.amazonaws.com',
        port: '',
        pathname: '/**',
      },
    ],
  },
  
  // Server external packages for MongoDB
  serverExternalPackages: ['mongodb'],
};

export default nextConfig;
