const path = require('path');
const { CleanWebpackPlugin } = require('clean-webpack-plugin');
const CopyPlugin = require('copy-webpack-plugin');
const HtmlWebpackPlugin = require('html-webpack-plugin');
const StylelintPlugin = require('stylelint-webpack-plugin');

module.exports = {
  entry: {
    index: './src/index.jsx',
  },
  target: 'web',
  resolve: {
    extensions: ['.js', '.jsx'],
    alias: {
      Utils: path.resolve(__dirname, 'src/utils/'),
    },
  },
  module: {
    rules: [
      {
        test: /\.(js|jsx)$/u,
        exclude: /node_modules/u,
        use: {
          loader: 'babel-loader',
          options: {
            presets: [
              '@babel/preset-env',
              [
                '@babel/preset-react',
                { runtime: 'automatic' },
              ],
            ],
          },
        },
      },
    ],
  },
  plugins: [
    new CleanWebpackPlugin(),
    new HtmlWebpackPlugin({
      title: 'React CRM',
      template: './template/index.html',
    }),
    new CopyPlugin({
      patterns: [
        { from: './static', to: './' },
      ],
    }),

  ],
};
