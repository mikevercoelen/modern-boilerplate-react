const path = require('path')
const webpack = require('webpack')
const ManifestPlugin = require('webpack-manifest-plugin')
const MiniCssExtractPlugin = require('mini-css-extract-plugin')
const OptimizeCssAssetsPlugin = require('optimize-css-assets-webpack-plugin')
const LodashModuleReplacementPlugin = require('lodash-webpack-plugin')
const CompressionPlugin = require('compression-webpack-pluigin')
const FriendlyErrorsWebpackPlugin = require('friendly-errors-webpack-plugin')
const { BundleAnalyzerPlugin } = require('webpack-bundle-analyzer')
const env = require('../app/helpers/env')

const USE_CSS_MODULES = true

const plugins = [
  new ManifestPlugin({
    fileName: path.resolve(process.cwd(), 'public/webpack-assets.json'),
    filter: file => file.isInitial
  }),
  new MiniCssExtractPlugin({
    filename: env.isDev ? '[name].css' : '[name].[contenthash:8].css',
    chunkFilename: env.isDev ? '[id].chunk.css' : '[id].[contenthash:8].chunk.css'
  }),
  new webpack.EnvironmentPlugin({
    NODE_ENV: JSON.stringify(process.env.NODE_ENV)
  }),
  new webpack.DefinePlugin({
    __CLIENT__: true,
    __SERVER__: false,
    __DEV__: env.isDev
  }),
  new FriendlyErrorsWebpackPlugin()
]

if (env.isDev) {
  plugins.push(new webpack.HotModuleReplacementPlugin())
}

if (env.isProd) {
  plugins.push(
    new webpack.HashedModuleIdsPlugin(),
    new CompressionPlugin({
      asset: '[path].gz[query]',
      algorithm: 'gzip',
      test: /\.jsx?$|\.css$|\.(scss)$|\.html$/,
      threshold: 10240,
      minRatio: 0.8
    }),
    new OptimizeCssAssetsPlugin(),
    new LodashModuleReplacementPlugin(),
    new BundleAnalyzerPlugin({
      analyzerMode: process.env.NODE_ENV === 'analyze' ? 'server' : 'disabled'
    })
  )
}

const rules = []

rules.push({
  test: /\.jsx?$/,
  exclude: /node_modules/,
  loader: 'babel',
  options: {
    cacheDirectory: env.isDev,
    babelrc: false,
    presets: [
      [
        '@babel/preset-env',
        {
          modules: false,
          useBuiltIns: 'usage'
        }
      ],
      '@babel/preset-react'
    ],
    plugins: [
      'react-hot-loader/babel',
      'loadable-components/babel',
      'lodash',
      '@babel/plugin-proposal-class-properties',
      '@babel/plugin-proposal-export-default-from',
      '@babel/plugin-proposal-optional-chaining'
    ]
  }
})

rules.push({
  test: /\.css$/,
  use: [
    MiniCssExtractPlugin.loader,
    {
      loader: 'css',
      options: {
        importLoaders: 1,
        modules: USE_CSS_MODULES,
        localIdentName: '[name]__[local]--[hash:base64:5]',
        context: path.resolve(process.cwd(), 'src'),
        sourceMap: true
      }
    },
    {
      loader: 'postcss',
      options: { sourceMap: true }
    }
  ]
})

rules.push({
  test: /\.scss/,
  use: [
    MiniCssExtractPlugin.loader,
    {
      loader: 'css',
      options: {
        importLoaders: 2,
        modules: USE_CSS_MODULES,
        localIdentName: '[name]__[local]--[hash:base64:5]',
        context: path.resolve(process.cwd(), 'src'),
        sourceMap: true
      }
    },
    {
      loader: 'postcss',
      options: { sourceMap: true }
    },
    {
      loader: 'sass',
      options: {
        outputStyle: 'expanded',
        sourceMap: true,
        sourceMapContents: !env.isDev
      }
    }
  ]
})

rules.push({
  test: /\.(woff2?|ttf|eot|svg)$/,
  loader: 'url',
  options: {
    limit: 10240,
    name: '[name].[hash:8].[ext]'
  }
})

rules.push({
  test: /\.(gif|png|jpe?g|webp)$/,
  // Any image below or equal to 10K will be converted to inline base64 instead
  loader: 'url',
  options: {
    limit: 10240,
    name: '[name].[hash:8].[ext]'
  }
})

module.exports = {
  mode: env.isDev ? 'development' : 'production',
  devtool: env.isDev ? 'eval' : 'hidden-source-map',
  context: path.resolve(process.cwd()),
  entry: env.isDev ? [
    'webpack-hot-middleware/client?reload=true',
    './src/client.js'
  ] : [
    './src/client.js'
  ],
  optimization: {
    splitChunks: {
      chunks: env.isDev ? 'async' : 'all'
    }
  },
  output: {
    path: path.resolve(process.cwd(), 'public/assets'),
    publicPath: '/assets/',
    filename: env.isDev ? '[name].js' : '[name].[chunkhash:8].js',
    chunkFilename: env.isDev ? '[id].chunk.js' : '[id].[chunkhash:8].chunk.js',
    pathinfo: env.isDev
  },
  module: {
    rules
  },
  plugins,
  resolve: {
    modules: [
      'src',
      'node_modules'
    ],
    descriptionFiles: ['package.json'],
    extensions: [
      '.js',
      '.json'
    ]
  },
  cache: env.isDev,
  // Some libraries import Node modules but don't use them in the browser.
  // Tell Webpack to provide empty mocks for them so importing them works.
  // https://webpack.github.io/docs/configuration.html#node
  // https://github.com/webpack/node-libs-browser/tree/master/mock
  node: {
    fs: 'empty',
    vm: 'empty',
    net: 'empty',
    tls: 'empty'
  }
}
