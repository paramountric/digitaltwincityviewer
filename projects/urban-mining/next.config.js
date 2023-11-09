/** @type {import('next').NextConfig} */
const { version } = require('./package.json');
const nextConfig = {
  reactStrictMode: false,
  swcMinify: false,
  output: 'standalone',
  publicRuntimeConfig: {
    version,
    maptilerApiKey: process.env.MAPTILER_API_KEY,
    googleApiKey: process.env.GOOGLE_API_KEY,
  },
};

module.exports = nextConfig;
