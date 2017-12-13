import * as React from 'react';
import {ReactIndexAssets} from '../dev/ReactIndexPlugin';
import {BuildOptions} from './BuildOptions';

type IndexProps = {
  assets?: ReactIndexAssets;
  options: BuildOptions,
};

/**
 * IMPORTANT: The Index template is special in that it's statically rendered on the server side.
 */
export const Index = ({assets, options}: IndexProps) => {
  return (
    <html>
      <head>
        <title>Dankest Dungeon</title>
        {assets.favicon && <link rel="shortcut icon" href={assets.favicon}/>}
        {assets.css.map((css) => <link key={css} rel="stylesheet" type="text/css" href={css}/>)}
      </head>
      <body>
        <script type="text/javascript" src="/vendor.dll.js"/>
        {assets.js.map((js) => <script key={js} type="text/javascript" src={js}/>)}
      </body>
    </html>
  );
};
