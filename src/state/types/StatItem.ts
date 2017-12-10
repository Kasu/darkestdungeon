import {StatInfo} from './StatInfo';
import {StatMod} from './Stats';
import {custom} from 'serializr';

export class StatItem {
  public value: number = 0;
  public mods: StatMod[] = [];
  public info: StatInfo;

  get isNeutral () {
    return this.value === 0;
  }

  get isPositive () {
    return this.value > 0;
  }

  get isNegative () {
    return this.value < 0;
  }

  get isBaseNeutral () {
    return this.value === this.baseStat.value;
  }

  get isBasePositive () {
    return this.value > this.baseStat.value;
  }

  get isBaseNegative () {
    return this.value < this.baseStat.value;
  }

  private get baseStat () {
    const baseMod = this.mods.find((m) => m.source.hasBaseStats);
    return baseMod ? baseMod.stat : this;
  }

  toString () {
    if (this.info.isPercentage) {
      return (this.value * 100).toFixed(1) + '%';
    }
    return this.value + '';
  }

  static declare (shortName: string, longName: string, isPercentage?: boolean) {
    const item = new StatItem();
    item.info = StatInfo.declare(shortName, longName, isPercentage);
    return item;
  }

  static serializr () {
    return custom(StatItem.serialize, StatItem.deserialize);
  }

  static serialize (item: StatItem) {
    return {
      value: item.value,
      infoId: item.info.id
    };
  }

  static deserialize ({value, infoId}: any) {
    const item = new StatItem();
    item.value = value;
    item.info = StatInfo.lookup.get(infoId);
    return item;
  }
}
