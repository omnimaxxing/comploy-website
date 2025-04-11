import { withPayload } from '@payloadcms/next/withPayload';

import redirects from './redirects.js';

const NEXT_PUBLIC_SERVER_URL = process.env.VERCEL_PROJECT_PRODUCTION_URL
  ? `https://${process.env.VERCEL_PROJECT_PRODUCTION_URL}`
  : undefined || process.env.NEXT_PUBLIC_SERVER_URL || 'http://localhost:3000';

/** @type {import('next').NextConfig} */
const nextConfig = {
  redirects,

  experimental: {
    reactCompiler: true,

    // Enable Partial Prerendering (PPR) in incremental mode
    ppr: 'incremental',

    //flag used in conjunction with 'use cache', to optmize performance of dynamic data fetching in server components
    //dynamicIO: true,

    // Increase server actions body size limit to 4MB
    serverActions: {
      bodySizeLimit: '4mb',
    },

    // Enable View Transitions API
    viewTransition: true,

    // Typed routes disabled for Turbopack compatibility
    // typedRoutes: true,
  },
  typescript: {
    ignoreBuildErrors: true,
  },
  eslint: {
    // Warning: This allows production builds to successfully complete even if
    // your project has ESLint errors.
    ignoreDuringBuilds: true,
  },

  reactStrictMode: true,
  images: {
    formats: ['image/avif', 'image/webp'],

    remotePatterns: [
      { hostname: 'localhost' },
      { protocol: 'http', hostname: 'localhost:3000' },
      {
        protocol: 'https',
        hostname: 'www.payloadplugins.com',
      },
      {
        protocol: 'https',
        hostname: 'payloadplugins.com',
      },
      {
        protocol: 'https',
        hostname: 'payloadplugins.vercel.app',
      },
      {
        protocol: 'https',
        hostname: 'images.unsplash.com',
      },
      {
        protocol: 'https',
        hostname: 'avatars.githubusercontent.com',
      },
      {
        protocol: 'https',
        hostname: 'github.com',
      },
      {
        protocol: 'https',
        hostname: 'payload-plugins.vercel.app',
      },
      {
        protocol: 'https',
        hostname: 'replicate.com',
      },
      {
        protocol: 'https',
        hostname: 'replicate.delivery',
      },
      ...[NEXT_PUBLIC_SERVER_URL].map(item => {
        const url = new URL(item);
        return {
          hostname: url.hostname,
          protocol: url.protocol.replace(':', ''),
        };
      }),
    ],
    // Conditional configurations for development
  },
};

export default withPayload(nextConfig);
