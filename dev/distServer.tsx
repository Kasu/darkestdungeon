import * as React from 'react';
import * as express from 'express';
import * as path from 'path';
import * as args from 'args';
import {renderToString} from 'react-dom/server';
import {Index} from '../shared/Index';
import {ReactIndexAssets} from './ReactIndexPlugin';
import * as fs from 'fs';
import {BuildInjects, BuildOptions} from '../shared/BuildOptions';

args
  .option('port', 'The port on which the server will be running')
  .option('host', 'The host on which the server should listen');

// Add injects to CLI
const injects = new BuildInjects();
const injectKeys = Object.keys(injects);
injectKeys.forEach((key) => args.option(key, key));

const cliArgs = args.parse(process.argv);

// Get injects from CLI
injectKeys.reduce(
  (dict, key) => {
    dict[key] = cliArgs[key];
    return dict;
  },
  injects as any
);

// Basic server config
const distFolder = path.resolve(__dirname, '../dist/');
const app = express();
app.set('host', cliArgs.host);
app.set('port', cliArgs.port);

// Distribute build on all routes
app.use(express.static(distFolder));
app.use('/', (req, res) => {
  const manifestJson = JSON.parse(fs.readFileSync(path.resolve(distFolder, 'manifest.json'), 'utf8'));
  const optionsJson = JSON.parse(fs.readFileSync(path.resolve(distFolder, 'buildOptions.json'), 'utf8'));
  const assets = ReactIndexAssets.fromManifest(manifestJson);
  const options = Object.assign(new BuildOptions(), optionsJson);

  res.send(
    renderToString(<Index assets={assets} options={options} injects={injects}/>)
  );
});

// Start server
app.listen(app.get('port'), app.get('host'), () => {
  console.log(`DistServer is running at http://${app.get('host')}:${app.get('port')}`);
});
