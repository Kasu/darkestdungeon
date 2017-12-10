import {Character} from './Character';
import {object, serializable} from 'serializr';
import {observable, transaction} from 'mobx';
import {HeroResidentInfo} from './HeroResidentInfo';
import {BuildingInfoId} from './BuildingInfo';
import {cmp} from '../../lib/Helpers';

export class Hero extends Character {
  @serializable @observable rosterIndex: number = 0;
  @serializable @observable lineupIndex: number = -1;
  @serializable @observable inLineup: boolean;

  @serializable(object(HeroResidentInfo))
  @observable
  residentInfo: HeroResidentInfo = null;

  changeName (newName: string) {
    this.name = newName;
  }

  leaveLineup () {
    this.inLineup = false;
    this.lineupIndex = -1;
  }

  enterResidence (buildingId: BuildingInfoId, slotIndex: number) {
    transaction(() => {
      this.residentInfo = new HeroResidentInfo();
      this.residentInfo.buildingId = buildingId;
      this.residentInfo.slotIndex = slotIndex;
    });
  }

  lockInResidency () {
    this.leaveLineup();
    this.residentInfo.isLockedIn = true;
  }

  leaveResidence () {
    this.residentInfo = null;
  }

  static comparers = {
    level (a: Hero, b: Hero) {
      return cmp(a.level.number, b.level.number);
    },

    stress (a: Hero, b: Hero) {
      return cmp(a.stats.stress.value, b.stats.stress.value);
    },

    className (a: Hero, b: Hero) {
      return a.classInfo.name.localeCompare(b.classInfo.name);
    },

    activity (a: Hero, b: Hero) {
      const activityA = a.residentInfo && a.residentInfo.buildingId;
      const activityB = b.residentInfo && b.residentInfo.buildingId;
      return cmp(activityA, activityB);
    },

    rosterIndex (a: Hero, b: Hero) {
      if (a.rosterIndex === b.rosterIndex) {
        return 0;
      }
      return a.rosterIndex < b.rosterIndex ? - 1 : 1;
    }
  };

  static visibleComparers = (() => {
    const dict = {...Hero.comparers};
    delete dict.rosterIndex;
    return dict;
  })();
}
