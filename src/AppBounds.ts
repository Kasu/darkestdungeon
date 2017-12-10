import {computed, observable} from 'mobx';
import {Bounds, Size} from './Bounds';
import {grid} from './config/Grid';

export class AppBounds {
  @observable realSize: Size = {width: 1, height: 1};

  @computed get scaledSize (): Size {
    const appBounds = new Bounds(0, 0, this.realSize.width, this.realSize.height);
    return Bounds.fitRatio(appBounds, grid.aspectRatio);
  }

  @computed get scale (): number {
    return this.scaledSize.width / grid.outerWidth;
  }

  @computed get arcSize (): Size {
    return {
      width: (this.realSize.width - this.scaledSize.width) / 2,
      height: (this.realSize.height - this.scaledSize.height) / 2
    };
  }

  transformClientPoint (x: number, y: number) {
    return {
      x: (x - this.arcSize.width) / this.scale,
      y: (y - this.arcSize.height) / this.scale
    };
  }
}
