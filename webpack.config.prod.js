const path = require('path');
const CssMinimizerPlugin = require('css-minimizer-webpack-plugin');
const ESLintPlugin = require('eslint-webpack-plugin');
const TerserPlugin = require('terser-webpack-plugin');
const webpack = require('webpack');
const { merge } = require('webpack-merge');
const common = require('./webpack.config.common');
const { v4: uuid } = require("uuid");

module.exports = merge(common, {
  mode: 'production',
  output: {
    filename: `[name].[contenthash].${uuid()}.js`,
    path: path.resolve(__dirname, 'dist'),
  },
  performance: {
    maxEntrypointSize: 750000,
    maxAssetSize: 750000,
  },
  optimization: {
    splitChunks: {
      chunks: 'all',
    },
    minimize: true,
    minimizer: [
      new TerserPlugin({
        extractComments: false,
        terserOptions: {
          format: {
            comments: false,
          },
        },
      }),
      new CssMinimizerPlugin(),
    ],
  },
  plugins: [
    new webpack.DefinePlugin({
      PRODUCTION: JSON.stringify(true),
    }),
    new ESLintPlugin({
      extensions: ['js', 'jsx'],
      overrideConfigFile: './.eslintrc.prod.js',
    }),
  ],
  module: {
    rules: [
      {
        test: /\.css$/,
        use: [
          {
            loader: 'style-loader',
            options: {
              injectType: 'singletonStyleTag',
            },
          },
          {
            loader: 'css-loader',
          },
        ],
      },
    ],
  },
});
