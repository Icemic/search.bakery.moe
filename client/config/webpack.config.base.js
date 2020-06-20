const webpack = require('webpack');
const ExtractTextPlugin = require('extract-text-webpack-plugin');
const path = require('path');
const postcssConfig = require('./postcss.config');
const sourcePath = path.resolve(__dirname, '../src');
const outputPath = path.resolve(__dirname, '../../static/dist');

module.exports = {
  // 入口文件
  entry: {
    'index': path.join(sourcePath, 'app.js'),
    vendor: ['react', 'react-dom', 'whatwg-fetch', 'babel-polyfill'],
  },
  // 出口文件
  output: {
    path: outputPath,
    publicPath: '/dist/',
    filename: '[name].js',
  },
  module: {
    // 配置编译打包规则
    rules: [
      {
        test: /\.(js|jsx)$/,
        exclude: /node_modules/,
        use: [
          {
            loader: 'babel-loader',
            query: {
              // presets: ['es2015', 'react'],
              cacheDirectory: true
            }
          }
        ]
      },
      {
        test: /\.css$/,
        use: ExtractTextPlugin.extract({
          fallback: "style-loader",
          use: [
            { loader: 'css-loader', options: { importLoaders: 1 } },
            { loader: 'postcss-loader', options: postcssConfig }
          ]
        }),
      },
      {
        test: /\.less$/,
        use: ExtractTextPlugin.extract({
          fallback: "style-loader",
          use: [
            { loader: 'css-loader', options: { importLoaders: 1 } },
            'less-loader',
            { loader: 'postcss-loader', options: postcssConfig }
          ]
        }),
      },
    ]
  },
  resolve: {
    extensions: ['.js', '.jsx'],
    modules: [
      sourcePath,
      'node_modules'
    ]
  },
  plugins: [
    new ExtractTextPlugin('[name].css'),
    new webpack.optimize.CommonsChunkPlugin({
      names: ['vendor'],
      minChunks: Infinity,
      filename: '[name].js'
    }),
  ]
};