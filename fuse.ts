import {src, task} from 'fuse-box/sparky';
import {FuseBox, EnvPlugin, QuantumPlugin, WebIndexPlugin, CopyPlugin, CSSPlugin, JSONPlugin} from 'fuse-box';
import {BuildOptions} from './shared/BuildOptions';

function createFuse (options: BuildOptions) {
  const fuse = FuseBox.init({
    homeDir: 'src',
    sourceMaps: {project: options.sourceMaps, vendor: false},
    hash: true,
    target: 'browser',
    output: 'dist/$name.js',
    alias: {
      'src': '~/'
    },
    warnings: true,
    cache: options.cache || options.hmr, // HMR requires cache
    log: true,
    debug: options.debug,
    tsConfig: 'tsconfig.json',
    useTypescriptCompiler: true,
    plugins: [
      EnvPlugin({NODE_ENV: options.environment}),
      WebIndexPlugin({title: 'Dankest Dungeon', path: '.'}),
      CSSPlugin(),
      JSONPlugin(),
      CopyPlugin({files: ['*.png', '*.jpg', '*.ogg'], dest: 'assets', useDefault: false}),
      options.minify ?
        QuantumPlugin({
          treeshake: true,
          uglify: true
        }) : undefined
    ]
  });

  const vendor = fuse.bundle('vendor')
    .instructions(`~ main.tsx`);

  const app = fuse.bundle('app')
    .instructions(`! polyfills/index.js + !> [main.tsx]`);

  return {fuse, vendor, app};
}

task('build', async (context: any) => {
    await src('./dist').clean('dist/').exec();
});

task('dev-server', async (context: any) => {
  const {fuse, vendor, app} = createFuse(new BuildOptions());

  fuse.dev();
  app.hmr();
  app.watch();

  await fuse.run();
});
