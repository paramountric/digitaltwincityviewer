const isProd = process.env.NODE_ENV === 'production';

/** @type {import('next').NextConfig} */
const nextConfig = {
  reactStrictMode: true,
  swcMinify: true,
  output: 'standalone',
  //basePath: '/out',
  //assetPrefix: isProd ? 'http://localhost:3000/' : undefined, // put the CDN url here for production if assets are distributed
  publicRuntimeConfig: {
    domain: process.env.DOMAIN,
    protocol: process.env.PROTOCOL,
  },
};

// if (isProd) {
//   const withExportImages = require('next-export-optimize-images');
//   module.exports = withExportImages(nextConfig);
// } else {
module.exports = nextConfig;
// }
