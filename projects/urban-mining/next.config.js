/** @type {import('next').NextConfig} */
const { version } = require('./package.json');
const nextConfig = {
  reactStrictMode: false,
  swcMinify: false,
  output: 'standalone',
  publicRuntimeConfig: {
    version,
    mvtUrl: process.env.MVT_URL,
    tile3dUrl: process.env.TILE_3D_URL,
    googleApiKey: process.env.GOOGLE_API_KEY,
    terrainUrl: process.env.TERRAIN_URL,
    terrainTextureUrl: process.env.TERRAIN_TEXTURE_URL,
  },
};

module.exports = nextConfig;
