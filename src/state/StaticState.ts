import {DungeonInfo} from './types/DungeonInfo';
import {LevelInfo} from './types/LevelInfo';
import {CharacterClassInfo} from './types/CharacterClassInfo';
import {ItemInfo, ItemType} from './types/ItemInfo';
import {QuirkInfo} from './types/QuirkInfo';
import {SkillInfo} from './types/SkillInfo';
import {CharacterTemplate} from './types/CharacterTemplate';
import {BuildingUpgradeInfo} from './types/BuildingUpgradeInfo';
import {BuildingInfo} from './types/BuildingInfo';
import {BuildingUpgradeEffects} from './types/BuildingUpgradeEffects';

export type StaticItem = {
  id: string | number
};

export class StaticState  {
  // noinspection TsLint
  private static internalInstance: StaticState;
  public static get instance () {
    return StaticState.internalInstance || (StaticState.internalInstance = new StaticState());
  }

  private constructor () {}

  items: ItemInfo[] = [];
  levels: LevelInfo[] = [];
  dungeons: DungeonInfo[] = [];
  quirks: QuirkInfo[] = [];
  skills: SkillInfo[] = [];
  heroes: CharacterTemplate[] = [];
  monsters: CharacterTemplate[] = [];
  classes: CharacterClassInfo[] = [];

  buildingInfoRoot = new BuildingInfo();
  buildingUpgrades: BuildingUpgradeInfo[] = [];
  get buildings () { return this.buildingInfoRoot.children; }

  get heirlooms () {
    return this.items.filter((info) => info.type === ItemType.Heirloom);
  }

  get afflictions () {
    return this.quirks.filter((info) => info.isAffliction);
  }

  getUpgradeEffects (keys: string[], upgrades = this.buildingUpgrades) {
    const selectedUpgrades = upgrades.filter((upgrade) => upgrade.isChildOf(keys));
    return selectedUpgrades
      .map((upgrade) => upgrade.effects)
      .reduce(
        (sum, item) => sum.add(item),
        new BuildingUpgradeEffects()
      );
  }

  add<T extends StaticItem> (selectList: (i: StaticState) => T[], item: T) {
    const list = selectList(this);
    const existingItem = list.find((otherItem) => otherItem.id === item.id);
    if (existingItem) {
      throw new Error('Static item already exists: ' + item.id);
    }
    list.push(item);
  }

  clear () {
    for (const key in this) {
      const prop: any = this[key];
      if (Array.isArray(prop)) {
        this[key] = [];
      } else if (prop instanceof Map) {
        prop.clear();
      }
    }
  }

  // Glue to provide a lookupFn interface for serializr
  public static lookup<T extends StaticItem> (selectList: (i: StaticState) => T[]) {
    return (id: string, resolve: (e: any, r: any) => void) => {
      const list = selectList(StaticState.instance);
      const item = list.find((i) => i.id === id);
      resolve(null, item);
    };
  }
}
