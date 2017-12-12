import * as React from 'react';
import * as express from 'express';
import * as path from 'path';
import {renderToString} from 'react-dom/server';
import {Index} from '../shared/Index';
import {ReactIndexAssets} from './ReactIndexPlugin';
import * as fs from 'fs';
import {BuildOptions} from '../shared/BuildOptions';

const distFolder = path.resolve(__dirname, '../dist/');
const app = express();

app.set('host', '0.0.0.0');
app.set('port', 4444);
app.set('env', 'production');

app.use(express.static(distFolder));
app.use('/', (req, res) => {
  const manifestJson = JSON.parse(fs.readFileSync(path.resolve(distFolder, 'manifest.json'), 'utf8'));
  const optionsJson = JSON.parse(fs.readFileSync(path.resolve(distFolder, 'buildOptions.json'), 'utf8'));
  const assets = ReactIndexAssets.fromManifest(manifestJson);
  const options = Object.assign(new BuildOptions(), optionsJson);

  res.send(
    renderToString(<Index assets={assets} options={options}/>)
  );
});

app.listen(app.get('port'), () => {
  console.log(`App is running at http://${app.get('host')}: ${app.get('port')} in ${app.get('env')}')`);
  console.log('Press CTRL-C to stop\n');
});
