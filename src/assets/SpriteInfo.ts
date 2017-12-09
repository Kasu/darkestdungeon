export class SpriteInfo {
  columns: number;
  rows: number;

  constructor (
    public url: string,
    public fps: number,
    public frames: number,
    public frameSize: {width: number, height: number},
    public sheetSize: {width: number, height: number},
    public parts: {[key: string]: [number, number]} = {}
  ) {
    this.columns = Math.floor(sheetSize.width / frameSize.width) || 0;
    this.rows = Math.floor(sheetSize.height / frameSize.height) || 0;
  }
}
