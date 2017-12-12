import * as React from 'react';
import {renderToString} from 'react-dom/server';
const HtmlWebpackPlugin = require('html-webpack-plugin');

const hwpProxy = {options: {}, childCompilationOutputName: ''};

export class ReactIndexPlugin {
  childCompilationOutputName: string;

  constructor (
    private filename: string,
    private element: any
  ) {}

  apply (compiler: any) {
    compiler.plugin('emit', this.onEmit.bind(this));
  }

  private getAssets (compiler: any) {
    let chunks = compiler.getStats().toJson().chunks;
    chunks = HtmlWebpackPlugin.prototype.filterChunks.bind(hwpProxy)(chunks);
    chunks = ReactIndexPlugin.sortChunks(chunks);
    const rawAssets = HtmlWebpackPlugin.prototype.htmlWebpackPluginAssets.bind(hwpProxy)(compiler, chunks);
    const assets = new ReactIndexAssets();
    Object.assign(assets, rawAssets);
    return assets;
  }

  private onEmit (compiler: any, done: (e?: any) => void) {
    try {
      const element = React.cloneElement(this.element, {
        assets: this.getAssets(compiler)
      });

      const output = renderToString(element);

      compiler.assets[this.filename] = {
        source: () => output,
        size: () => output.length
      };
    } catch (err) {
      return done(err);
    }

    done();
  }

  static sortChunks (chunks: any[]) {
    return HtmlWebpackPlugin.prototype.sortChunks.bind(hwpProxy)(
      chunks.filter((chunk) => chunk)
    );
  }
}

export class ReactIndexAssets {
  constructor (
    public favicon?: string,
    public js: string[] = [],
    public css: string[] = []
  ) {}

  static fromManifest (files: string[]): ReactIndexAssets {
    return {
      favicon: files.find((file) => /\.ico$/.test(file)),
      js: files.filter((file) => /\.js$/.test(file)),
      css: files.filter((file) => /\.css$/.test(file)),
    };
  }
}
