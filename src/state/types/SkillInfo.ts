import {identifier, serializable} from 'serializr';
import {IStatsSource, Stats, TurnStats} from './Stats';
import {Character} from './Character';

export type SkillSpots = [boolean, boolean, boolean, boolean];

export enum SkillTargetObject {
  Ally,
  Enemy
}

export class SkillTarget {
  constructor (
    public spots?: SkillSpots,
    public object?: SkillTargetObject
  ) {}

  select (allies: Character[], enemies: Character[]) {
    allies = forceLength(allies, 4);
    enemies = forceLength(enemies, 4);

    const targets = this.object === SkillTargetObject.Ally ? allies : enemies;
    const selected: Character[] = [];

    // Check if there are available targets matching this skill
    for (let i = 0; i < this.spots.length; i += 1) {
      if (this.spots[i] && targets[i]) {
        selected.push(targets[i]);
      }
    }
    return selected;
  }

  canTarget (allies: Character[], enemies: Character[]) {
    return this.select(allies, enemies).length > 0;
  }

  static oneOf (
    spots: SkillSpots,
    object: SkillTargetObject = SkillTargetObject.Enemy
  ) {
    return new SkillTarget(spots, object);
  }

  static anyOne (type: SkillTargetObject) {
    return SkillTarget.oneOf([true, true, true, true], type);
  }

  static backline = [true, true, false, false];
  static frontline = [false, false, true, true];
  static midline = [false, true, true, false];
}

export type SkillId = string;

export class SkillInfo implements IStatsSource {
  @serializable(identifier()) id: SkillId;
  name: string;
  iconUrl: string;
  statsSourceName: string = 'Skill';
  stats: Stats = new Stats();

  position: [boolean, boolean, boolean, boolean] = [true, true, true, true];
  damageScale: number = 1;
  movement: number = 0;
  statusTurns: number = 3;
  target: SkillTarget;
  buff: TurnStats;

  canUse (actor: Character, allies: Character[], enemies: Character[]) {
    allies = forceLength(allies, 4);
    enemies = forceLength(enemies, 4);
    const actorPosition = allies.indexOf(actor);

    // Check if this skill can be used from the specified location
    return this.position[actorPosition] && this.target.canTarget(allies, enemies);
  }
}

function forceLength <T> (list: T[], length: number) {
  if (list.length === length) {
    return list;
  }
  if (list.length > length) {
    throw new Error('List should not be larger than ' + length);
  }
  const forced = list.slice();
  let rest = length - list.length;
  while ((rest -= 1) > 0) {
    forced.unshift(null);
  }
  return forced;
}
