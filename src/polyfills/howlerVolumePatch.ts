import {Howl} from 'howler';

(global as any).Howl = Howl;

const originalFade = Howl.prototype.fade;
const originalVolume = Howl.prototype.volume;

Howl.prototype.fade = function (from: number, to: number) {
  this.__monkeyPatchVolume = to;
  return originalFade.apply(this, arguments);
};

Howl.prototype.volume = function (volume: number) {
  // Setting volume
  if (arguments.length > 0) {
    this.__monkeyPatchVolume = volume;
    return originalVolume.apply(this, arguments);
  }

  // Getting volume
  if (this.__monkeyPatchVolume === undefined) {
    return originalVolume.apply(this, arguments);
  }
  return this.__monkeyPatchVolume;
};
