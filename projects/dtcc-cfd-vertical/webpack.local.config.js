const { resolve, join } = require('path');
const Dotenv = require('dotenv-webpack');
const { CleanWebpackPlugin } = require('clean-webpack-plugin');
const HtmlWebpackPlugin = require('html-webpack-plugin');

module.exports = env => {
  return {
    mode: 'none',
    entry: './src/index.ts',
    devtool: 'inline-source-map',
    output: {
      filename: 'index.js',
      path: resolve(__dirname, 'dist'),
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
      port: 3000,
      client: {
        webSocketURL: 'ws://localhost:4000',
        overlay: { errors: true, warnings: false },
      },
    },
    plugins: [
      new Dotenv({
        systemvars: true,
      }),
      new CleanWebpackPlugin(),
      new HtmlWebpackPlugin({
        template: './src/index.html',
      }),
    ],
  };
};
