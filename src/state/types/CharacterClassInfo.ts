import {identifier, serializable} from 'serializr';
import {IStatsSource} from './Stats';
import {Stats} from './Stats';
import {SkillInfo} from './SkillInfo';

export class CharacterClassInfo implements IStatsSource {
  @serializable(identifier()) id: string;
  name: string;
  avatarUrl: string = require('../../assets/images/hero.png');
  skillDescription = 'Class skill description';
  equipmentDescription = 'Class equipment description';
  stats: Stats;
  statsSourceName: string = 'Class';
  hasBaseStats: boolean = true;
  skills: SkillInfo[] = [];
}
