import * as express from 'express';
import * as cors from 'cors';
import * as args from 'args';
import {fluxibleFetchrSplit} from './fluxibleFetchrSplit';
const Fluxible = require('fluxible');
const createFetchrPlugin = require('fluxible-plugin-fetchr');

args
  .option('port', 'The port on which the server will be running')
  .option('host', 'The host on which the server should listen');

const cliArgs = args.parse(process.argv);

// Basic server config
const server = express();
server.set('host', cliArgs.host);
server.set('port', cliArgs.port);
const baseUrl = server.get('host') + ':' + server.get('port');

// Configure services
const services = [
  {
    name: 'data_service',
    read (req: any, resource: any, params: any, config: any, callback: any) {
      callback(null, 'response');
    }
  }
];

// Set up fluxible and fetchr
const fluxible = new Fluxible();
const fetchr = createFetchrPlugin({xhrPath: '/api', corsPath: `http://${baseUrl}`});
fluxible.plug(fetchr);
services.forEach((service) => fetchr.registerService(service));

// Enable CORS
server.use(cors());

// Expose fluxible and fetchr
server.use(fluxibleFetchrSplit(fluxible, fetchr));

// Start server
server.listen(server.get('port'), server.get('host'), () => {
  console.log(`APIServer is running at ${server.get('host')}:${server.get('port')}`);
});
