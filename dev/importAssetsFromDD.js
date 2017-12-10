const path = require('path');

if (process.argv.length < 3) {
  console.error('Invalid script usage!');
  console.log('Usage: node <path-to>/' + path.basename(__filename), '<path-to-steam-folder>', '[audio|images]');
  process.exit(1);
  return;
}

const {importImages, getImagePaths, importAudio, getAudioBankNames} = require('./importFunctions');
const {audioQuery, imageQuery} = require('./importConfig');

const imports = {
  'audio': () => importAudio(getAudioBankNames(audioQuery)),
  'images': () => importImages(getImagePaths(imageQuery))
};

const type = process.argv[3];
if (type) {
  imports[type]();
} else {
  let sequence = Promise.resolve();
  for (const key in imports) {
    sequence = sequence.then(imports[key]);
  }
}