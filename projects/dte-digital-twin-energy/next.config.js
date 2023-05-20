const path = require('path');

/** @type {import('next').NextConfig} */
const nextConfig = {
  reactStrictMode: false,
  swcMinify: false,
  output: 'standalone',
  publicRuntimeConfig: {
    domain: process.env.DOMAIN,
    protocol: process.env.PROTOCOL,
    tokenUrl: process.env.TOKEN_URL,
    authUrl: process.env.AUTH_URL,
    wsUrl: process.env.WS_URL,
    notesUrl: process.env.NOTES_URL,
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
