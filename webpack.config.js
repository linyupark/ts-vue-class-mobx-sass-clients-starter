const path = require('path');
const webpack = require('webpack');
const HtmlWebpackPlugin = require('html-webpack-plugin');
const VueLoaderPlugin = require('vue-loader/lib/plugin');
const ExtractCssChunks = require('extract-css-chunks-webpack-plugin');
const UglifyJsPlugin = require('uglifyjs-webpack-plugin');
const CompressionPlugin = require('compression-webpack-plugin');
const OptimizeCssAssetsPlugin = require('optimize-css-assets-webpack-plugin');


/**
 * 环境变量
 * @type {String}
 */
const ENV = process.env.NODE_ENV;
const CLIENT = process.env.CLIENT || 'default';
const API = process.env.API || ENV;

/**
 * 设置路径快捷函数
 */
const setPath = url => path.resolve(__dirname, url);

/**
 * 配置（公共部分）
 * @type {Object}
 */
let config = {
  /**
   * 入口文件设置
   * @type {Object}
   */
  entry: {
    main: ['./src/index.js']
  },

  /**
   * 自动引入后缀名 & 解析别名规则
   * @type {Object}
   */
  resolve: {
    alias: {
      '@assets': setPath('src/assets'),
      '@config': setPath('src/configs'),
      '@lib': setPath('src/libs'),
      '@page': setPath('src/components/pages'),
      '@module': setPath('src/components/modules'),
      '@partial': setPath('src/components/partials'),
      '@model': setPath('src/models')
    },
    extensions: ['.ts', '.vue', '.js', '.scss', '.css', '.sass']
  },

  /**
   * loader 规则
   * @type {Object}
   */
  module: {
    rules: [
      {
        test: /\.(js|ts)$/,
        include: [setPath('src')],
        use: [
          {
            loader: 'babel-loader',
            options: {
              babelrc: true,
              cacheDirectory: true
            }
          }
        ]
      },
      {
        test: /\.vue$/,
        loader: 'vue-loader'
      },
      {
        test: /\.(scss|sass|css)$/,
        include: [setPath('src')],
        use: [
          ENV === 'development'
            ? 'vue-style-loader'
            : {
                loader: ExtractCssChunks.loader,
                options: {
                  publicPath: '../'
                }
              },
          {
            loader: 'css-loader',
            options: {
              importLoaders: 2
            }
          },
          {
            loader: 'postcss-loader'
          },
          {
            loader: 'sass-loader',
            options: {
              import: [setPath(`src/assets/themes/${CLIENT}/styles/var`)]
            }
          }
        ]
      },
      {
        test: /\.(png|jpe?g|gif|svg)(\?.*)?$/,
        include: setPath('src'),
        loader: 'url-loader',
        options: {
          limit: 10000,
          name: 'img/[name].[hash:5].[ext]'
        }
      },
      {
        test: /\.(mp4|webm|ogg|mp3|wav|flac|aac)(\?.*)?$/,
        include: setPath('src'),
        loader: 'url-loader',
        options: {
          limit: 10000,
          name: 'media/[name].[hash:5].[ext]'
        }
      },
      {
        test: /\.(woff2?|eot|ttf|otf)(\?.*)?$/,
        include: setPath('src'),
        loader: 'url-loader',
        options: {
          limit: 10000,
          name: 'fonts/[name].[hash:5].[ext]'
        }
      }
    ]
  },

  /**
   * 插件列表
   * @type {Array}
   */
  plugins: [
    // vue loader 必用
    new VueLoaderPlugin(),

    // 全局环境变量定义
    new webpack.DefinePlugin({
      __ENV__: JSON.stringify(ENV),
      __API__: JSON.stringify(API),
      __VER__: JSON.stringify(require('./package.json').version),
      __CLIENT__: JSON.stringify(CLIENT)
    }),

    // html 文件
    new HtmlWebpackPlugin({
      // favicon: './src/assets/favicon.ico',
      template: './index.html',
      filename: './index.html',
      inject: 'body'
    }),

    new ExtractCssChunks({
      filename: 'css/[name].[hash:5].css',
      chunkFilename: 'css/[name].[id].[hash:5].css',
      hot: ENV === 'development',
      orderWarning: ENV === 'development',
      reloadAll: ENV === 'development',
      cssModules: false
    })
  ],

  /**
   * 优化配置
   */
  optimization: {
    splitChunks: {
      cacheGroups: {
        common: {
          name: 'common',
          chunks: 'all',
          minChunks: 2
        }
      }
    }
  }
};

/**
 * 开发环境配置
 */
if (ENV === 'development') {
  config.mode = ENV;
  config.devtool = 'source-map';
  config.plugins.push(new webpack.HotModuleReplacementPlugin());
  config.devServer = {
    clientLogLevel: 'warning',
    hot: true,
    host: '0.0.0.0',
    // port: '8080',
    stats: {
      assets: true,
      performance: true,
      timings: true,
      builtAt: false,
      children: false,
      chunks: false,
      hash: false,
      entrypoints: false,
      modules: false,
      cached: false,
      cachedAssets: false
    }
  };
}

/**
 * 发布配置
 */
if (ENV !== 'development') {
  config.output = {
    filename: 'script/[name].[chunkhash:5].js',
    path: setPath('dist'),
    publicPath: ''
  };
  config.plugins.push(
    new CompressionPlugin({
      cache: true,
      threshold: 10240
    })
  );
  config.plugins.push(new webpack.optimize.ModuleConcatenationPlugin());
  config.optimization.minimizer = [
    // 优化 js
    new UglifyJsPlugin({
      exclude: /\.min\.js$/,
      cache: true,
      sourceMap: false,
      parallel: true,
      extractComments: false,
      uglifyOptions: {
        compress: {
          unused: true,
          warnings: false,
          drop_console: true
        },
        output: {
          comments: false
        }
      }
    }),
    // 优化 css
    new OptimizeCssAssetsPlugin({
      assetNameRegExp: /\.css$/g,
      cssProcessorOptions: {
        safe: true,
        autoprefixer: { disable: true },
        mergeLonghand: false,
        discardComments: {
          removeAll: true
        }
      },
      canPrint: true
    })
  ];
}

module.exports = config;
