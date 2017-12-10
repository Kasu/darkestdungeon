import {custom, serializable} from 'serializr';

export type PathTypes = Path | string;

export class Path {
  public static separator: string = '/';

  @serializable public value: string;

  @serializable(custom((val) => val, (val) => val))
  public args: any;

  get parts () {
    return this.value.split(Path.separator);
  }

  get root () {
    return this.parts[0];
  }

  constructor (
    value: string = '',
    args: any = {}
  ) {
    this.value = value;
    this.args = args;
  }

  equals (possibleOther: PathTypes) {
    const other = ensurePath(possibleOther);
    return other && other.value === this.value &&
      JSON.stringify(other.args) === JSON.stringify(this.args);
  }

  toString () {
    return this.value;
  }
}

export function ensurePath (path: PathTypes): Path {
  if (typeof path === 'string') {
    return new Path(path);
  }
  if (!path) {
    return new Path('');
  }
  return path as Path;
}
