import {identifier, serializable} from 'serializr';

export class LevelInfo {
  @serializable(identifier()) id: number;
  name: string;
  number: number;
  experience: number;

  constructor (
    public previous?: LevelInfo,
    public next?: LevelInfo
  ) {}

  get isMax () {
    return !this.next;
  }

  get relativeExperience () {
    const from = this.previous ? this.previous.experience : 0;
    return this.experience - from;
  }
}
