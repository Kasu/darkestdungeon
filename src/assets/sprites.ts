import {SpriteInfo} from './SpriteInfo';

export const smoke = new SpriteInfo(
  require('./images/smoke.png'), 30, 45,
  {width: 256, height: 256},
  require('image-size-loader!./images/smoke.png')
);
