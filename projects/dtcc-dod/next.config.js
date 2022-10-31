/** @type {import('next').NextConfig} */
const nextConfig = {
  reactStrictMode: false,
  swcMinify: false,
  output: 'standalone',
  publicRuntimeConfig: {
    domain: process.env.DOMAIN,
    protocol: process.env.PROTOCOL,
  },
};

module.exports = nextConfig;
