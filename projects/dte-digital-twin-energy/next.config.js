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
    wsDomain: process.env.WS_DOMAIN,
    wsPath: process.env.WS_PATH,
    notesUrl: process.env.NOTES_URL,
    dtcvFilesUrl: process.env.DTCV_FILES_URL,
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
