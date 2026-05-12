const path = require('path');
const ESLintPlugin = require('eslint-webpack-plugin');
const webpack = require('webpack');
const { merge } = require('webpack-merge');
const common = require('./webpack.config.common');

module.exports = () => merge(common, {
  mode: 'development',
  devtool: 'inline-source-map',
  output: {
    filename: '[name].js',
    path: path.resolve(__dirname, 'dist'),
  },
  devServer: {
    historyApiFallback: true,
    port: 9000,
    open: true,
    client: {
      logging: 'verbose',
      overlay: {
        errors: true,
        warnings: false,
      },
      progress: true,
    },
    server: {
      type: 'http',
      options: {
        ca: './cert/myCA.pem',
        key: './cert/localhost.key',
        cert: './cert/localhost.crt',
      },
    },
  },
  plugins: [
    new webpack.DefinePlugin({
      PRODUCTION: JSON.stringify(false),
    }),
    new ESLintPlugin({
      extensions: ['js', 'jsx'],
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
            options: {
              sourceMap: true,
            },
          },
          'postcss-loader',
        ],
      },
    ],
  },
});
