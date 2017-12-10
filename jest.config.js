const binaries = '\\.(jpg|jpeg|png|gif|eot|otf|webp|svg|ttf|woff|woff2)$';
const audio = '\\.(mp4|webm|wav|ogg|mp3|m4a|aac|oga)$';

module.exports = {
  moduleFileExtensions: ['ts', 'tsx', 'js', 'jsx'],
  setupFiles: [
    '<rootDir>/src/polyfills/index.js'
  ],
  transform: {
    '^.+\\.tsx?$': '<rootDir>/dev/jest/tsPreprocessor.js',
  },
  testMatch: [
    '**/*.test.(ts|tsx|js|jsx)'
  ],
  moduleNameMapper: {
    [audio]: '<rootDir>/dev/jest/mock/emptyAudio.js',
    [binaries]: '<rootDir>/dev/jest/mock/empty.js',
    '\\.css$': '<rootDir>/dev/jest/mock/empty.js',
    '^image-size-loader$': '<rootDir>/dev/jest/mock/imageSize.js'
  }
};
