import {Experienced} from './Experienced';
import {identifier, reference, serializable} from 'serializr';
import {v4 as uuid} from 'uuid';
import {StaticState} from '../StaticState';
import {DungeonInfo} from './DungeonInfo';

export type DungeonId = string;

export class Dungeon extends Experienced {
  @serializable(identifier()) id: DungeonId = uuid();

  @serializable(reference(DungeonInfo, StaticState.lookup((i) => i.dungeons)))
  info: DungeonInfo;

  static fromInfo (info: DungeonInfo) {
    const dungeon = new Dungeon();
    dungeon.info = info;
    return dungeon;
  }
}
