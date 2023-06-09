const path = require('path');

/** @type {import('next').NextConfig} */
const nextConfig = {
  reactStrictMode: false,
  swcMinify: false,
  output: 'standalone',
  publicRuntimeConfig: {
    domain: process.env.DOMAIN || process.env.NEXT_PUBLIC_DOMAIN,
    protocol: process.env.PROTOCOL || process.env.NEXT_PUBLIC_PROTOCOL,
    tokenUrl: process.env.TOKEN_URL || process.env.NEXT_PUBLIC_TOKEN_URL,
    authUrl: process.env.AUTH_URL || process.env.NEXT_PUBLIC_AUTH_URL,
    wsDomain: process.env.WS_DOMAIN || process.env.NEXT_PUBLIC_WS_DOMAIN,
    wsPath: process.env.WS_PATH || process.env.NEXT_PUBLIC_WS_PATH,
    notesUrl: process.env.NOTES_URL || process.env.NEXT_PUBLIC_NOTES_URL,
    dtcvFilesUrl:
      process.env.DTCV_FILES_URL || process.env.NEXT_PUBLIC_DTCV_FILES_URL,
  },
  experimental: {
    outputFileTracingRoot: path.join(__dirname, '../../'),
    esmExternals: 'loose',
  },
  webpack: (config, { buildId, dev, isServer, defaultLoaders, webpack }) => {
    config.experiments = { ...config.experiments, topLevelAwait: true };
    return config;
  },
  transpilePackages: ['@dtcv/viewer'],
};

module.exports = nextConfig;
