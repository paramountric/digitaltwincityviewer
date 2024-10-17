/** @type {import('next').NextConfig} */
const nextConfig = {
  reactStrictMode: true,
  experimental: {
    largePageDataBytes: 128 * 100000,
    serverActions: {
      bodySizeLimit: "200mb",
    },
  },
  webpack: (config, { buildId, dev, isServer, defaultLoaders, webpack }) => {
    config.experiments = { ...config.experiments, topLevelAwait: true };
    // due to a third party library that trying to include complete folder (?)
    config.module.rules.push({
      test: /\.(html|cs)$/,
      loader: "ignore-loader",
    });

    // Fixes warning Critical dependency: the request of a dependency is an expression
    config.module = {
      ...config.module,
      exprContextCritical: false,
    };

    return config;
  },
  images: {
    remotePatterns: [
      {
        protocol: "http",
        hostname: "127.0.0.1",
        port: "54321",
      },
    ],
  },
};

export default nextConfig;
