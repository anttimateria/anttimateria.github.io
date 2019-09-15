const webpack = require('webpack');
const HtmlWebPackPlugin = require('html-webpack-plugin');
const MiniCssExtractPlugin = require('mini-css-extract-plugin');
const CleanWebpackPlugin = require('clean-webpack-plugin');
const CopyWebpackPlugin = require('copy-webpack-plugin');
const TerserPlugin = require('terser-webpack-plugin');
const BundleAnalyzerPlugin = require('webpack-bundle-analyzer').BundleAnalyzerPlugin;
const { VueLoaderPlugin } = require('vue-loader');

// Try the environment variable, otherwise use root
const ASSET_PATH = process.env.ASSET_PATH || '/';

module.exports = {
  entry: './src/index.js',
  output: {
    path: __dirname + '/dist',
    publicPath: ASSET_PATH,
    filename: 'script.js'
  },
  target: 'web',
  optimization: {
    minimizer: [
      new TerserPlugin({
        terserOptions: {
          ecma: 5,
          sourceMap: true,
        },
      }),
    ],
  },
  module: {
    rules: [
      {
        test: /\.vue$/,
        use: 'vue-loader'
      },
      {
        test: /\.js$/,
        loader: 'babel-loader'
      },
      {
        test: /\.(png|jpg|gif)$/,
        use: [
          {
            loader: 'file-loader',
            options: {
              outputPath: 'img/'
            }
          },
        ],
      },
      {
        test: /\.(mp4|webm|ogg)$/,
        use: [
          {
            loader: 'file-loader',
            options: {
              outputPath: 'video'
            },
          },
        ],
      },
      {
        test: /\.(mp3)$/,
        use: [
          {
            loader: 'file-loader',
            options: {
              outputPath: 'audio'
            },
          },
        ],
      },
      {
        test: /\.html$/,
        use: [
          {
            loader: 'html-loader'
          }
        ]
      },
      {
        test: /\.(scss|sass|css)$/,
        use: [
          'vue-style-loader',
          'css-loader',
          'sass-loader'
        ]
      }
    ]
  },
  plugins: [
    // This makes it possible for us to safely use env vars on our code
    new CleanWebpackPlugin(['dist']),
    new webpack.DefinePlugin({
      'process.env.ASSET_PATH': JSON.stringify(ASSET_PATH)
    }),
    new VueLoaderPlugin(),
    new HtmlWebPackPlugin({
      template: 'src/index.html',
      filename: './index.html',
      inject: true
    }),/*
    new MiniCssExtractPlugin({
      filename: 'styles.css',
    }),*/
    new CopyWebpackPlugin([
      {
        from: 'src/scss/styles.css',
        to: 'styles.css',
        toType: 'file'
      },
    ]),
    // new BundleAnalyzerPlugin()
  ],
};