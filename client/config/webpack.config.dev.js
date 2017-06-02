var merge = require('webpack-merge')
var webpack = require('webpack')
var baseWebpackConfig = require('./webpack.config.base');

module.exports = merge(baseWebpackConfig, {

  devtool: 'source-map',
  plugins: [
    new webpack.DefinePlugin({
      'process.env': {
        NODE_ENV: JSON.stringify('development')
      }
    }),
    new webpack.HotModuleReplacementPlugin(),
    // 开启全局的模块热替换(HMR)

    new webpack.NamedModulesPlugin(),
  ]
});
