/** @type {import('next').NextConfig} */
const nextConfig = {
  reactStrictMode: true,
  experimental: {
    serverActions: {
      bodySizeLimit: '500mb',
    },
  },
  images: {
    domains: ['localhost'],
  },
}

module.exports = nextConfig

