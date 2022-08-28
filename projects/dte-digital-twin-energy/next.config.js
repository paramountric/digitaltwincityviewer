/** @type {import('next').NextConfig} */
const nextConfig = {
  reactStrictMode: true,
  swcMinify: false,
  output: 'standalone',
  publicRuntimeConfig: {
    domain: process.env.DOMAIN,
    protocol: process.env.PROTOCOL,
  },
};

module.exports = nextConfig;
