import * as React from 'react';
import {ReactIndexAssets} from '../dev/ReactIndexPlugin';
import {BuildInjects, BuildOptions} from './BuildOptions';

type IndexProps = {
  assets?: ReactIndexAssets;
  options: BuildOptions,
  injects: BuildInjects
};

/**
 * IMPORTANT: The Index template is special in that it's statically rendered on the server side.
 */
export const Index = ({assets, options, injects}: IndexProps) => {
  const injectedBuildOptionsJs = `
  window.buildInjects = ${JSON.stringify(injects)};
  `;
  return (
    <html>
      <head>
        <title>Dankest Dungeon</title>
        {assets.favicon && <link rel="shortcut icon" href={assets.favicon}/>}
        {assets.css.map((css) => <link key={css} rel="stylesheet" type="text/css" href={css}/>)}
      </head>
      <body>
        {options.vendor && <script type="text/javascript" src="vendor.dll.js"/>}
        <script type="text/javascript" dangerouslySetInnerHTML={{__html: injectedBuildOptionsJs}}/>
        {assets.js.map((js) => <script key={js} type="text/javascript" src={js}/>)}
      </body>
    </html>
  );
};
