import type { NextConfig } from "next";

const nextConfig: NextConfig = {
  // API configuration for large file uploads
  experimental: {
    serverActions: {
      bodySizeLimit: '50mb',
    },
  },

  // Performance optimizations
  compress: true,
  
  // Image optimization with enhanced settings
  images: {
    formats: ['image/avif', 'image/webp'],
    deviceSizes: [640, 750, 828, 1080, 1200, 1920, 2048, 3840],
    imageSizes: [16, 32, 48, 64, 96, 128, 256, 384],
    minimumCacheTTL: 60,
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
      {
        protocol: 'https',
        hostname: '*.public.blob.vercel-storage.com',
        port: '',
        pathname: '/**',
      },
    ],
  },
  
  // Server external packages for MongoDB
  serverExternalPackages: ['mongodb'],
  
  // Output configuration
  output: 'standalone',
  
  // Power optimization
  poweredByHeader: false,
};

export default nextConfig;
