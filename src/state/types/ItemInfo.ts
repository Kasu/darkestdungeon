import {identifier, serializable} from 'serializr';
import {Stats, TurnStats} from './Stats';
import {Quest} from './Quest';

export enum ItemType {
  Weapon = 'W',
  Armor = 'A',
  Trinket = 'T',
  Treasure = 'TR',
  Consumable = 'C',
  Heirloom = 'H'
}

export enum HeirloomType {
  Bust,
  Portrait,
  Deed,
  Crest
}

export class ItemInfo {
  @serializable(identifier()) id: string;

  name: string = '[single name]';
  pluralName: string = '[plural name]';
  iconUrl?: string;
  itemUrl?: string;
  description: string = '';
  type: ItemType = ItemType.Consumable;
  heirloomType?: HeirloomType;
  value: number = 0;
  sellValueScale: number = 1;
  stats: Stats = new Stats();
  resetHunger: boolean;
  removeBuffs: boolean;
  offsetLight: number = 0;
  buff?: TurnStats;
  getStoreCount?: (q: Quest) => number;

  get sellValue () {
    return Math.round(this.value * this.sellValueScale);
  }

  get isStackable () {
    switch (this.type) {
      case ItemType.Consumable:
      case ItemType.Heirloom:
        return true;
    }
    return false;
  }

  get isSellable () {
    switch (this.type) {
      case ItemType.Consumable:
      case ItemType.Treasure:
        return true;
    }
  }

  get isReward () {
    switch (this.type) {
      case ItemType.Weapon:
      case ItemType.Armor:
      case ItemType.Trinket:
        return true;
    }
  }
}
