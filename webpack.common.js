const path = require('path')
const TsconfigPathsPlugin = require('tsconfig-paths-webpack-plugin')
const CopyPlugin = require('copy-webpack-plugin')
const { ProvidePlugin } = require('webpack')

module.exports = {
  target: 'web'
, entry: {
    'background': './src/background/index.ts'
  , 'options': './src/options/index.tsx'
  }
, output: {
    path: path.join(__dirname, 'dist')
  , filename: '[name].js'
  }
, resolve: {
    extensions: ['.ts', '.tsx', '.js', '.json']
  , plugins: [new TsconfigPathsPlugin()]
  , fallback: {
      'util': require.resolve('util/')
    , 'path': require.resolve('path-browserify')
    }
  }
, module: {
    rules: [
      {
        test: /\.tsx?$/
      , exclude: /node_module/
      , use: 'ts-loader'
      }
    , {
        test: /\.css$/i,
        use: ['style-loader', 'css-loader', 'postcss-loader'],
      }
    ]
  }
, plugins: [
    new ProvidePlugin({
      process: 'process'
    })
  , new CopyPlugin({
      patterns: [
        {
          from: './src'
        , globOptions: {
            ignore: ['**/*.ts', '**/*.tsx', '**/*.html', '**/manifest.*.json']
          }
        }
      , { from: './src/options/index.html', to: 'options.html' }
      ]
    })
  ]
}
