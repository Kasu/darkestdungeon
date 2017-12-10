import {observable} from 'mobx';
import {identifier, reference, serializable} from 'serializr';
import uuid = require('uuid');
import {StaticState} from '../StaticState';
import {HeirloomType, ItemInfo, ItemType} from './ItemInfo';
import {IStatsSource, Stats} from './Stats';
import {cmp} from '../../lib/Helpers';

export type ItemId = string;

export class Item implements IStatsSource {
  @serializable(identifier()) id: ItemId = uuid();
  @serializable @observable level: number = 1;

  @serializable(reference(ItemInfo, StaticState.lookup((i) => i.items)))
  info: ItemInfo;

  get name () { return this.info.name; }
  statsSourceName: string = 'Item';

  get statsScale () {
    const maxItemLevel = StaticState.instance.getUpgradeEffects(['blacksmith']).level;
    return 1 + ((this.level - 1) / maxItemLevel);
  }

  get stats () {
    const scaledStats = new Stats();
    scaledStats.add(this.info.stats);
    scaledStats.scale(this.statsScale);
    return scaledStats;
  }

  static comparers = {
    type (a: Item, b: Item) {
      return cmp(a.info.type, b.info.type);
    },

    name (a: Item, b: Item) {
      return a.info.name.localeCompare(b.info.name);
    }
  };

  static fromInfo (info: ItemInfo) {
    const item = new Item();
    item.info = info;
    return item;
  }

  asLevel (level: number) {
    const item = new Item();
    item.level = level;
    item.info = this.info;
    return item;
  }
}

export function countHeirlooms (items: Item[]) {
  return items
    .filter((item) => item.info.type === ItemType.Heirloom)
    .reduce(
      (sum, item) => {
        sum.set(item.info.heirloomType, (sum.get(item.info.heirloomType) || 0) + 1);
        return sum;
      },
      new Map<HeirloomType, number>()
    );
}
