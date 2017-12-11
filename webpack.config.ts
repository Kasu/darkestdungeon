import * as path from 'path';
import * as webpack from 'webpack';
import {HotModuleReplacementPlugin, LoaderOptionsPlugin, NamedModulesPlugin, NewModule} from 'webpack';
import CommonsChunkPlugin = webpack.optimize.CommonsChunkPlugin;
import {cpus} from 'os';
import {downloadI18n} from './dev/i18nSync';
const {BundleAnalyzerPlugin} = require('webpack-bundle-analyzer');
const ExtractTextPlugin = require('extract-text-webpack-plugin');
const HtmlWebpackPlugin = require('webpack-html-plugin');
const UglifyJsPlugin = require('uglifyjs-webpack-plugin');
const WebpackManifestPlugin = require('webpack-manifest-plugin');
const ForkTsCheckerWebpackPlugin = require('fork-ts-checker-webpack-plugin');
const HappyPack = require('happypack');

const fileLoader = {
  loader: 'file-loader',
  options: {
    name: 'assets/[hash].[ext]'
  }
};

const imageCompressionLoader = {
  loader: 'image-webpack-loader',
  options: {
    mozjpeg: {progressive: true, quality: 65},
    optipng: {enabled: false},
    pngquant: {quality: '65-90', speed: 4},
    gifsicle: {interlaced: false},
    webp: {quality: 75}
  }
};

class BuildOptions {
  constructor (
    public outputFolder: string = 'dist',
    public environment: string = 'development',
    public i18nVersion: string = 'latest',

    // Optional features. All default to false
    public sourceMaps = false,
    public debug: boolean = false,
    public cache: boolean = false,
    public hmr: boolean = false,
    public compress: boolean = false,
    public minify: boolean = false,
    public analyzeBundles: boolean = false,
    public stats: boolean = false,
    public manifest: boolean = false
  ) {}
}

// NOTE webpack requires a default export
export default async function webpackConfig (additionalOptions?: BuildOptions)  { // tslint:disable-line
  const options = {
    ...new BuildOptions(),
    ...additionalOptions
  };

  console.log('BuildOptions', JSON.stringify(options, null, 2));

  // Make sure we have i18n up to date before continuing
  await downloadI18n(options.i18nVersion);

  const sourceFolder = path.join(__dirname, 'src');
  const babelOptions = {
    cacheDirectory: options.cache ? '.babel-cache' : undefined,
    presets: ['flow', 'react', 'stage-0']
  };

  // (numberOfCpus - 1x current cpu) / 3x plugins needing threads
  const threadDistributionCount = Math.max(1, Math.floor((cpus().length - 1) / 3));

  const config: webpack.Configuration = {
    // What code to build and where to put it
    entry: compact([
      path.join(sourceFolder, 'polyfills', 'index.js'),
      options.hmr && 'react-hot-loader/patch',
      path.join(sourceFolder, 'main.tsx')
    ]),
    output: {
      path: path.join(__dirname, options.outputFolder),
      filename: 'app.js'
    },

    // Most webpack configs are controlled by our options
    stats: options.stats,
    cache: options.cache,
    devtool: options.sourceMaps ? 'source-map' : undefined,

    // Determine which extensions to lazy-load and how to look for sources
    resolve: {
      extensions: ['.ts', '.tsx', '.js', '.jsx'],
      alias: {
        aphrodite: 'aphrodite/no-important'
      }
    },

    // Teach webpack how to load various modules
    module: {
      rules: [
        // Code (More config on HappyPack plugins below)
        {test: /\.tsx?$/, loader: 'happypack/loader?id=ts'},
        {test: /\.jsx?$/, loader: 'happypack/loader?id=js'},

        // Assets
        {
          test: /\.(png|jpe?g)$/,
          use: compact([
            fileLoader,
            options.compress && imageCompressionLoader
          ])
        },
        {
          test: /\.css$/,
          use: ExtractTextPlugin.extract({
            fallback: 'style-loader',
            use: 'css-loader'
          })
        },
        {test: /\.yml$/, use: ['json-loader', 'yaml-loader']},
        {test: /\.json$/, use: 'json-loader'},
        {test: /\.(ttf|ogg|eot|woff|woff2|svg)$/, use: fileLoader}
      ]
    },
    plugins: compact([
      // Generate html entry point that automatically loads our bundles
      new HtmlWebpackPlugin({title: 'Dankest Dungeon', filename: 'index.html'}),

      new webpack.DefinePlugin({
        'process.env': {
          NODE_ENV: JSON.stringify(options.environment),
          HMR: options.hmr
        }
      }),

      // Add optimizations
      new ExtractTextPlugin('styles.css'),
      new CommonsChunkPlugin({
        name: 'vendor',
        filename: 'vendor.js',
        minChunks: (module) => module.context && module.context.indexOf('node_modules') >= 0
      }),
      // new webpack.NormalModuleReplacementPlugin(/^react?$/, require.resolve('react')),
      new ForkTsCheckerWebpackPlugin({
        checkSyntacticErrors: true,
        workers: threadDistributionCount,
        watch: [sourceFolder]
      }),
      new HappyPack({
        id: 'ts',
        threads: threadDistributionCount,
        loaders: compact([
          options.hmr && 'react-hot-loader/webpack',
          {path: 'babel-loader', query: babelOptions},
          {path: 'ts-loader', query: {
            happyPackMode: true,
            transpileOnly: true, // Disable type checker (ForksTsChecker is doing it in a separate thread)
            compilerOptions: {
              sourceMap: options.sourceMaps
            }
          }}
        ])
      }),
      new HappyPack({
        id: 'js',
        threads: threadDistributionCount,
        loaders: compact([
          options.hmr && 'react-hot-loader/webpack',
          {path: 'babel-loader', query: babelOptions}
        ])
      }),

      // Optional features
      options.manifest && new WebpackManifestPlugin(),
      options.hmr && new NamedModulesPlugin(),
      options.hmr && new HotModuleReplacementPlugin(),
      options.debug && new LoaderOptionsPlugin({debug: true}),
      options.analyzeBundles && new BundleAnalyzerPlugin({analyzerMode: 'static'}),
      options.minify && new UglifyJsPlugin({test: /\.js$/})
    ]),
    devServer: {
      hot: options.hmr
    }
  };

  // Loaders should only be applied to project sources
  for (const rule of (config.module as NewModule).rules) {
    rule.exclude = /node_modules/;
  }

  return config;
}

function compact<T> (array: T[]) {
  return array.filter((item) => item);
}
