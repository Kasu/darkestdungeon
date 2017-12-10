import {identifier, serializable} from 'serializr';

export class StatInfo {
  @serializable(identifier()) id: string;

  constructor (
    public shortName: string,
    public longName: string = shortName,
    public isPercentage: boolean = false

  ) {
    this.id = shortName;
  }

  public static lookup = new Map<string, StatInfo>();
  static declare (shortName: string, longName: string, isPercentage?: boolean) {
    const id = shortName;
    let info = StatInfo.lookup.get(id);
    if (info) {
      return info;
    }

    info = new StatInfo(shortName, longName, isPercentage);
    StatInfo.lookup.set(id, info);
    return info;
  }
}
