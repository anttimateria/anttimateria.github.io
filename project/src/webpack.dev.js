const webpack = require('webpack');
const HtmlWebPackPlugin = require('html-webpack-plugin');
const CopyWebpackPlugin = require('copy-webpack-plugin');
const { VueLoaderPlugin } = require('vue-loader');
const path = require('path');

// Try the environment variable, otherwise use root
const ASSET_PATH = process.env.ASSET_PATH || '/';

module.exports = {
  mode: 'development',
  entry: './src/index.js',
  output: {
    publicPath: ASSET_PATH,
    filename: 'script.js'
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
              useRelativePath: false,
              name: '[name].[ext]'
            },
          },
        ],
      },
      /*
      {
        test: /\.(jpe?g|png)$/i,
        loader: 'responsive-loader',
        options: {
          adapter: require('responsive-loader/sharp'),
          sizes: [300, 600, 900, 1200, 1440, 2000],
          placeholder: true,
          placeholderSize: 50
        }
      },*/
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
        test: /\.(css|scss)$/,
        use: [
          'vue-style-loader',
          'css-loader',
          'sass-loader'
        ]
      }
    ]
  },
  resolve: {
    // options for resolving module requests
    // (does not apply to resolving to loaders)
    modules: [
      'node_modules',
      path.resolve(__dirname, 'dist')
    ],
  },
  plugins: [
    // This makes it possible for us to safely use env vars on our code
    /*
    new webpack.DefinePlugin({
      'process.env.ASSET_PATH': JSON.stringify(ASSET_PATH)
    }),*/
    new VueLoaderPlugin(),
    new HtmlWebPackPlugin({
      template: 'src/index.html',
      filename: './index.html',
      inject: true
    }),
  ],
  devtool: 'eval-source-map',
  devServer: {
    contentBase: './dist',
    compress: true,
    port: 3000,
    disableHostCheck: true,
    index: 'index.html',
    headers: {
      'Access-Control-Allow-Origin': '*'
    },
  }
};