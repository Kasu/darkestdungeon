import * as fs from 'fs';
import * as React from 'react';
import * as path from 'path';
import * as webpack from 'webpack';
import {HotModuleReplacementPlugin, LoaderOptionsPlugin, NamedModulesPlugin, NewModule} from 'webpack';
import CommonsChunkPlugin = webpack.optimize.CommonsChunkPlugin;
import {cpus} from 'os';
import {downloadI18n} from './dev/i18nSync';
import {Index} from './shared';
import {ReactIndexPlugin} from './dev/ReactIndexPlugin';
import {BuildInjects, BuildOptions} from './shared/BuildOptions';
import {removeItem} from './src/lib/Helpers';
const HtmlWebpackPlugin = require('html-webpack-plugin');
const AutoDllPlugin = require('autodll-webpack-plugin');
const WebpackHtmlPlugin = require('webpack-html-plugin');
const {BundleAnalyzerPlugin} = require('webpack-bundle-analyzer');
const ExtractTextPlugin = require('extract-text-webpack-plugin');
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

// NOTE webpack requires a default export
export default async function webpackConfig (additionalOptions?: BuildOptions & BuildInjects)  { // tslint:disable-line
  const options = {
    ...new BuildOptions(),
    ...additionalOptions
  };

  console.log('BuildOptions', JSON.stringify(options, null, 2));

  // Make sure we have i18n up to date before continuing
  await downloadI18n(options.i18nVersion);

  const sourceFolder = path.join(__dirname, 'src');

  // (numberOfCpus - 1x current cpu) / 2x plugins needing threads
  const threadDistributionCount = Math.max(1, Math.floor((cpus().length - 1) / 2));

  const config: webpack.Configuration = {
    // What code to build and where to put it
    entry: compact([
      path.join(sourceFolder, 'polyfills', 'index.ts'),
      options.hmr && 'react-hot-loader/patch',
      path.join(sourceFolder, 'main.tsx')
    ]),
    output: {
      filename: '[name].bundle.js',
      path: path.join(__dirname, options.outputFolder),
      publicPath: '/'
    },

    // Most webpack configs are controlled by our options
    stats: options.stats,
    cache: options.cache,
    devtool: options.sourceMaps ? 'source-map' : undefined,

    // Determine which extensions to lazy-load and how to look for sources
    resolve: {
      extensions: ['.ts', '.tsx', '.js'],
      alias: {
        aphrodite: 'aphrodite/no-important'
      }
    },

    // Teach webpack how to load various modules
    module: {
      rules: [
        // Code (More config on HappyPack plugins below)
        {test: /\.tsx?$/, loader: 'happypack/loader?id=ts'},

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
        {test: /\.json$/, use: 'json-loader'},
        {test: /\.(ttf|ogg|eot|woff|woff2|svg)$/, use: fileLoader}
      ]
    },
    plugins: compact([
      // DevServer needs an index.html generated
      options.index && new ReactIndexPlugin(
        'index.html',
        <Index options={options} injects={additionalOptions} />
      ),

      // DistServer will render Index.tsx manually to pass in dynamic props, so it needs a manifest
      options.manifest && new WebpackManifestPlugin({
        generate: (seed: any, files: any[]) => {
          // Generate buildOptions.json along with the manifest
          const json = JSON.stringify(options, null, 2);
          const outputFile = path.resolve(config.output.path, 'buildOptions.json');
          fs.writeFileSync(outputFile, json);

          // Generate manifest
          return generateOrderedManifest(seed, files);
        }
      }),

      // Define the environment
      new webpack.DefinePlugin({
        'process.env': {
          NODE_ENV: JSON.stringify(options.environment)
        }
      }),

      // Add optimizations
      new ExtractTextPlugin('styles.css'),
      new CommonsChunkPlugin({
        name: 'common',
        filename: 'common.js',
        minChunks: (module: any) => module.context && module.context.indexOf('node_modules') >= 0
      }),
      options.vendor && new AutoDllPlugin({
        inject: true,
        debug: true,
        filename: '[name].dll.js',
        entry: {
          vendor: Object.keys(JSON.parse(fs.readFileSync('./package.json', 'utf8')).dependencies)
        }
      }),
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
          {path: 'ts-loader', query: {
            happyPackMode: true,
            transpileOnly: true, // Disable type checker (ForksTsChecker is doing it in a separate thread)
            compilerOptions: {
              sourceMap: options.sourceMaps,
              module: 'esnext'
            }
          }}
        ])
      }),

      // Optional features
      options.hmr && new NamedModulesPlugin(),
      options.hmr && new HotModuleReplacementPlugin(),
      options.debug && new LoaderOptionsPlugin({debug: true}),
      options.analyzeBundles && new BundleAnalyzerPlugin({analyzerMode: 'static'}),
      options.minify && new UglifyJsPlugin()
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

function compact <T> (array: T[]) {
  return array.filter((item) => item);
}

function generateOrderedManifest (seed: any, files: any[]) {
  const orderedFiles = files.slice();
  ReactIndexPlugin.sortChunks(files.map((f) => f.chunk))
    .forEach((sortedChunk: any) => {
      const sortedFile = files.find((f) => f.chunk === sortedChunk);
      if (sortedFile) {
        removeItem(orderedFiles, sortedFile);
        orderedFiles.push(sortedFile);
      }
    });

  return orderedFiles.map((file) => file.path);
}
