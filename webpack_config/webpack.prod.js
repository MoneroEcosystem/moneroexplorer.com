const TerserPlugin = require('terser-webpack-plugin');
const ExtractTextPlugin = require('extract-text-webpack-plugin');
const FaviconsWebpackPlugin = require('favicons-webpack-plugin');
const CopyWebpackPlugin = require('copy-webpack-plugin');
const common = require('./webpack.common.js');
const merge = require('webpack-merge');
const webpack = require('webpack');
const path = require('path');

const config = merge(common, {
  optimization: {
    minimize: false, // ← disables both Terser and UglifyJs
  },
  output: {
    publicPath: '/'
  },
  module: {
    rules: [
      {
        test: /\.scss$|\.css$/,
        use: ExtractTextPlugin.extract({
          fallback: 'style-loader',
          use: [
            {
              loader: 'css-loader',
              options: { minimize: true }
            },
            {
              loader: 'resolve-url-loader'
            },
            {
              loader: 'sass-loader',
              options: {
                sourceMap: true,
                implementation: require('sass')
              }
            }
          ]
        })
      }
    ]
  },
  plugins: [
    new webpack.DefinePlugin({
      'process.env.NODE_ENV': 'production'
    }),
    new FaviconsWebpackPlugin(path.join(__dirname, '../src/assets/imgs/favicon.png')),
    new CopyWebpackPlugin([
      {
        from: path.join(__dirname, '../src/assets/imgs/og.png'),
        to: path.join(__dirname, '../dist')
      },
      {
        from: path.join(__dirname, '../public/sitemap.xml'),
        to: path.join(__dirname, '../dist')
      }
    ])
  ]
});

module.exports = config;