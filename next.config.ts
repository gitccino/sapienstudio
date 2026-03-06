import type { NextConfig } from 'next'
const DIST_DOMAIN_NAME = process.env.NEXT_PUBLIC_DIST_DOMAIN_NAME!

const nextConfig: NextConfig = {
  turbopack: {
    rules: {
      '*.svg': {
        loaders: ['@svgr/webpack'],
        as: '*.js',
      },
    },
  },
  images: {
    remotePatterns: [new URL(`https://${DIST_DOMAIN_NAME}/**`)],
  },
  // allowedDevOrigins: ['local-origin.dev', '*.local-origin.dev'],
}

export default nextConfig
