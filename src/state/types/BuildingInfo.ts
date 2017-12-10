import {BuildingUpgradeInfo} from './BuildingUpgradeInfo';

export type BuildingInfoId = string;

const idSeparator = '.';

export class BuildingInfo {
  key: string;
  name: string;
  description: string;
  iconUrl: string;
  avatarUrl: string;
  npcImageUrl: string;
  npcBarks: string[] = [];
  slotImageUrl: string;
  backgroundUrl: string;
  enterSound: IHowlProperties;
  useSound: IHowlProperties;

  children = new Map<string, BuildingInfo>();
  items: BuildingUpgradeInfo[] = [];
  parent: BuildingInfo;

  getItemsFlattened () {
    let flattenedItems = this.items;
    this.children.forEach((child) =>
      flattenedItems = flattenedItems.concat(child.getItemsFlattened())
    );
    return flattenedItems;
  }

  get (id: BuildingInfoId) {
    const keys = id.split(idSeparator);
    let info: BuildingInfo = this;
    while (keys.length) {
      info = info.children.get(keys.shift());
    }
    return info;
  }

  get id () {
    let next: BuildingInfo = this;
    const keys = [];
    while (next) {
      keys.push(next.key);
      next = next.parent;
    }
    return createId(keys.reverse());
  }
}

export function createId (keys: string[]): BuildingInfoId {
  return keys.filter((key) => key).join(idSeparator);
}
