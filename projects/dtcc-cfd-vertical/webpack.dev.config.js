const { resolve, join } = require('path');
const Dotenv = require('dotenv-webpack');
const { CleanWebpackPlugin } = require('clean-webpack-plugin');
const HtmlWebpackPlugin = require('html-webpack-plugin');

const publicPath = 'https://pmtric-local.com/dtcv/';

module.exports = {
  mode: 'development',
  entry: './src/index.ts',
  devtool: 'inline-source-map',
  output: {
    filename: 'index.js',
    path: resolve(__dirname, 'dist'),
    publicPath,
  },
  module: {
    rules: [
      {
        test: /\.tsx?$/,
        use: 'ts-loader',
        exclude: /node_modules/,
      },
      {
        test: /\.png/,
        type: 'asset/resource',
      },
    ],
  },
  resolve: {
    extensions: ['.ts', '.tsx', '.js', 'json'],
  },
  devServer: {
    allowedHosts: 'all',
    headers: {
      'Access-Control-Allow-Origin': '*',
      'Access-Control-Allow-Methods': '*',
      'Access-Control-Allow-Headers': '*',
    },
    devMiddleware: {
      index: true,
      publicPath: '/dtcv',
      writeToDisk: true,
    },
    https: false,
    host: '0.0.0.0',
    historyApiFallback: { disableDotRule: true, index: '/dtcv' }, // serve the index.html page on 404
    port: 3000,
    client: {
      webSocketURL: 'wss://pmtric-local.com/dtcv/ws',
      overlay: { errors: true, warnings: false },
    },
    static: {
      directory: join(__dirname, 'public'), // where dev server serves content from
      publicPath: `${publicPath}/public`, // where to serve static files from (images, etc)
    },
  },
  watchOptions: {
    poll: 1000,
  },
  plugins: [
    new Dotenv(),
    new CleanWebpackPlugin(),
    new HtmlWebpackPlugin({
      template: './src/index.html',
    }),
  ],
};
