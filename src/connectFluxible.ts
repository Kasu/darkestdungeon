import axios from 'axios';
import {buildInjects} from './buildInjects';
const Fluxible = require('fluxible');
const fetchrPlugin = require('fluxible-plugin-fetchr');

const fetchDataAction = (actionContext: any, payload: any, done: () => void) =>  {
 actionContext.service
   .read('data_service')
   .params({foo: 'bar'})
   .end((err: any, data: any, meta: any) => {
     console.log('received data from fetchr api', data);
     done();
   });
};

export async function connectFluxible () {
  const response = await axios.get(buildInjects.apiServerBaseUrl + '/init');
  const fluxible = new Fluxible();
  const fetchr = fetchrPlugin();
  fluxible.plug(fetchr);

  fluxible.rehydrate(response.data, (err: any, context: any) => {
    context.executeAction(fetchDataAction);
  });
}
