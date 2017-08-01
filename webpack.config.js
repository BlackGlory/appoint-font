const CopyWebpackPlugin = require('copy-webpack-plugin')
const path = require('path')

module.exports = {
  target: 'web'
, devtool: 'source-map'
, entry: {
    'options': './src/options.js'
  , 'background': './src/background.js'
  , 'force': './src/force.js'
  }
, output: {
    path: path.join(__dirname, 'dist')
  , filename: '[name].js'
  }
, module: {
    rules: [
      {
        test: /\.js$/
      , exclude: /node_module/
      , use: 'babel-loader'
      }
    ]
  }
, plugins: [
    new CopyWebpackPlugin(
      [
        { from: './src' }
      ]
    , { ignore: ['*.js'] })
  ]
}
