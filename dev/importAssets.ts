import * as path from 'path';

if (process.argv.length < 3) {
  console.error('Invalid script usage!');
  console.log('Usage: node <path-to>/' + path.basename(__filename), '<path-to-steam-folder>', '[audio|images]');
  process.exit(1);
}

import {importImages, getImagePaths, importAudio, getAudioBankNames} from './importHelpers';
import {audioQuery, imageQuery} from './importConfig';

const imports = {
  audio: () => importAudio(getAudioBankNames(audioQuery)),
  images: () => importImages(getImagePaths(imageQuery))
};

const type = process.argv[3] as ('audio' | 'images');
if (type) {
  imports[type]();
} else {
  let sequence = Promise.resolve();
  for (const key in imports) {
    sequence = sequence.then((imports as any)[key]);
  }
}
