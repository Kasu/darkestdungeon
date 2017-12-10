import {date, identifier, list, object, reference, serializable} from 'serializr';
import {action, computed, observable, transaction} from 'mobx';
import {Path} from './Path';
import {EstateEvent} from './EstateEvent';
import {Hero} from './Hero';
import {Quest, QuestId, QuestStatus} from './Quest';
import {countHeirlooms, Item} from './Item';
import {Dungeon} from './Dungeon';
import {generateHero, generateQuest} from '../Generators';
import {cap, contains, count, moveItem, removeItem, removeItems} from '../../lib/Helpers';
import {StaticState} from '../StaticState';
import {BuildingUpgradeInfo} from './BuildingUpgradeInfo';
import {HeirloomType} from './ItemInfo';
import {BuildingInfoId} from './BuildingInfo';
import {Stats} from './Stats';
import {HeroResidentInfo} from './HeroResidentInfo';
import {Skill} from './Skill';
import {MapSize} from './QuestMap';
import {Difficulty} from './Difficulty';
import uuid = require('uuid');

export type ProfileId = string;

const nullEstateEvent = new EstateEvent();
nullEstateEvent.shown = true;

export class Profile {
  @serializable(identifier()) id: ProfileId = uuid();
  @serializable difficulty: Difficulty;
  @serializable @observable isNameFinalized: boolean = false;
  @serializable @observable name: string = '';
  @serializable(object(Path)) @observable path: Path;
  @serializable @observable week: number = 0;
  @serializable(date()) @observable dateOfLastSave: Date = new Date();
  @serializable @observable selectedQuestId?: QuestId;
  @serializable @observable gold: number = 0;
  @observable debt: number = 0;

  @computed get goldAfterDebt () { return this.gold - this.debt; }

  @serializable(object(EstateEvent))
  @observable
  estateEvent = nullEstateEvent;

  @serializable(list(object(Hero)))
  @observable
  coach: Hero[] = [];

  @serializable(list(object(Hero)))
  @observable
  roster: Hero[] = [];

  @serializable(list(object(Hero)))
  @observable
  graveyard: Hero[] = [];

  @serializable(list(object(Quest)))
  @observable
  quests: Quest[] = [];

  @serializable(list(object(Item)))
  @observable
  items: Item[] = [];

  @serializable(list(object(Dungeon)))
  @observable
  allDungeons: Dungeon[] = [];

  @serializable(list(reference(BuildingUpgradeInfo, StaticState.lookup((i) => i.buildingUpgrades))))
  @observable
  buildingUpgrades: BuildingUpgradeInfo[] = [];

  @computed get selectableDungeons () {
    return this.allDungeons.filter((d) => !d.info.isStartingDungeon);
  }

  @computed get startingDungeons () {
    return this.allDungeons.filter((d) => d.info.isStartingDungeon);
  }

  get heirloomConversionRate () {
    return 1.5;
  }

  @computed get heirloomCounts () {
    return countHeirlooms(this.items);
  }

  @computed get lineupSlots () {
    const members: Hero[] = [undefined, undefined, undefined, undefined];
    this.lineup.forEach((member) => members[member.lineupIndex] = member);
    return members;
  }

  @computed get lineup () {
    return this.roster
      .filter((c) => c.inLineup)
      .sort((a, b) => {
        if (a.lineupIndex === b.lineupIndex) {
          return 0;
        }
        return a.lineupIndex < b.lineupIndex ? -1 : 1;
      });
  }

  @computed get isLineupFull () {
    return this.lineup.length === 4;
  }

  @computed get selectedQuest () {
    return this.quests.find((q) => q.id === this.selectedQuestId);
  }

  @computed get selectedDungeon () {
    if (this.selectedQuest) {
      return this.allDungeons.find((d) => d.id === this.selectedQuest.dungeonId);
    }
  }

  @computed get isRosterFull () {
    return this.roster.length === this.rosterSize;
  }

  @computed get rosterSize () {
    return this.getUpgradeEffects('coach', 'roster').size;
  }

  @computed get coachSize () {
    return this.getUpgradeEffects('coach', 'network').size;
  }

  processResidencyEffects () {
    this.roster
      .filter((hero) => hero.residentInfo && hero.residentInfo.isLockedIn)
      .forEach((resident) => {
        const upgrades = this.getUpgradeEffects(resident.residentInfo.buildingId);

        // Recover a percentage of the residents stress
        const recoveryPercentage = cap(upgrades.recovery, 0, 1);
        const recoveryStats = new Stats();
        recoveryStats.stress.value -= recoveryPercentage * resident.stats.stress.value;
        resident.offsetStats(recoveryStats);

        // Remove treated quirk
        if (resident.residentInfo.treatmentId) {
          removeItem(
            resident.quirks,
            resident.quirks.find((q) => q.id === resident.residentInfo.treatmentId)
          );
        }

        resident.residentInfo = null;
      });
  }

  clearNonLockedResidents () {
    this.roster
      .filter((hero) => hero.residentInfo && !hero.residentInfo.isLockedIn)
      .forEach((hero) => hero.residentInfo = null);
  }

  purchaseItem (item: Item, inventory: Item[]) {
    this.gold -= item.info.value;
    inventory.push(item);
  }

  sellItem (item: Item, inventory: Item[]) {
    this.gold += item.info.sellValue;
    removeItem(inventory, item);
  }

  getResidencyCost (residency: HeroResidentInfo) {
    const cost = this.getUpgradeEffects(residency.buildingId).cost;
    const quirkToTreat = StaticState.instance.quirks.find((q) => q.id === residency.treatmentId);
    const costScale = quirkToTreat ? quirkToTreat.treatmentCostScale : 1;
    return cost * costScale;
  }

  purchaseResidency (resident: Hero) {
    resident.lockInResidency();
    this.gold -= this.getResidencyCost(resident.residentInfo);
  }

  findResident (buildingId: BuildingInfoId, slotIndex: number) {
    return this.roster.find((hero) =>
      hero.residentInfo &&
      hero.residentInfo.buildingId === buildingId &&
      hero.residentInfo.slotIndex === slotIndex
    );
  }

  purchaseItemLevelUp (item: Item) {
    item.level += 1;
    this.gold -= this.getUpgradeEffects('blacksmith').cost;
  }

  purchaseSkillLevelUp (skill: Skill) {
    skill.level += 1;
    this.gold -= this.getUpgradeEffects('guild').cost;
  }

  getUpgradeEffects (...keys: string[]) {
    return StaticState.instance.getUpgradeEffects(keys, this.buildingUpgrades);
  }

  ownsUpgrade (upgradeItem: BuildingUpgradeInfo) {
    return contains(this.buildingUpgrades, upgradeItem);
  }

  purchaseUpgrade (upgradeItem: BuildingUpgradeInfo) {
    this.offsetHeirlooms(upgradeItem.cost, -1);
    this.buildingUpgrades.push(upgradeItem);
  }

  hasEnoughHeirlooms (requiredAmounts: Map<HeirloomType, number>) {
    for (const [type, requiredAmount] of requiredAmounts.entries()) {
      if ((this.heirloomCounts.get(type) || 0) < requiredAmount) {
        return false;
      }
    }
    return true;
  }

  getConvertedHeirloomValue (amount: number, from: HeirloomType, to: HeirloomType) {
    const fromInfo = StaticState.instance.heirlooms.find((info) => info.heirloomType === from);
    const toInfo = StaticState.instance.heirlooms.find((info) => info.heirloomType === to);
    return Math.floor(
      (amount * (fromInfo.value / this.heirloomConversionRate)) / toInfo.value
    );
  }

  tradeHeirlooms (givenAmount: number, from: HeirloomType, to: HeirloomType) {
    const receivedAmount = this.getConvertedHeirloomValue(givenAmount, from, to);
    const deal = new Map<HeirloomType, number>();
    deal.set(from, -givenAmount);
    deal.set(to, receivedAmount);
    this.offsetHeirlooms(deal);
  }

  @action
  offsetHeirlooms (offset: Map<HeirloomType, number>, multiplier: number = 1) {
    offset.forEach((amount, type) => {
      amount *= multiplier;

      if (amount < 0) {
        // Remove heirlooms from inventory
        const removed = this.items
          .filter((item) => item.info.heirloomType === type)
          .slice(0, Math.abs(amount));
        removeItems(this.items, removed);
      } else if (amount > 0) {
        // Add new heirlooms to inventory
        const heirloomInfo = StaticState.instance.heirlooms
          .find((info) => info.heirloomType === type);
        const newHeirlooms = count(amount).map(() => Item.fromInfo(heirloomInfo));
        this.items.push(...newHeirlooms);
      }
    });
  }

  joinLineup (newHero: Hero, slotIndex: number = -1) {
    if (slotIndex === -1) {
      slotIndex = this.lineupSlots.findIndex((member) => !member);
      if (slotIndex === -1) {
        throw new Error(`Can't join full party`);
      }
    }

    const oldHero = this.lineupSlots[slotIndex];

    // Slot is free, join directly
    if (!oldHero) {
      newHero.inLineup = true;
      newHero.lineupIndex = slotIndex;
      return;
    }

    // Slot is taken, make space
    if (newHero.inLineup) {
      // Hero just wants to swap places in the party
      const oldIndex = newHero.lineupIndex;
      newHero.lineupIndex = slotIndex;
      oldHero.lineupIndex = oldIndex;
    } else {
      // Let new hero take the old ones place
      newHero.inLineup = true;
      newHero.lineupIndex = slotIndex;

      // Move old hero to a new slot if it exists, otherwise kick from lineup
      oldHero.leaveLineup();
      const availableIndex = this.lineupSlots.findIndex((member) => !member);
      if (availableIndex !== -1) {
        oldHero.inLineup = true;
        oldHero.lineupIndex = availableIndex;
      }
    }
  }

  sendLineupOnQuest (quest: Quest) {
    this.lineup.forEach((member) => moveItem(member, this.roster, quest.party));
  }

  returnPartyFromQuest (quest: Quest) {
    const dungeon = this.allDungeons.find((d) => d.id === quest.dungeonId);

    // For successful journeys we hand out experience and rewards
    if (quest.status === QuestStatus.Victory) {
      // Give experience to the surviving heroes
      quest.party.forEach((hero) => hero.experience += dungeon.experienceWorth);

      // Give experience to the dungeon
      const wholeParty = [...quest.party, ...quest.deceased];
      const partyExperienceWorth = wholeParty.reduce((sum, hero) => sum + hero.experienceWorth, 0);
      dungeon.experience += partyExperienceWorth;

      // Add rewards to profile inventory
      while (quest.rewards.length) {
        this.items.push(quest.rewards.pop());
      }
    }

    // Return living heroes to roster with refreshed health
    while (quest.party.length) {
      const hero = quest.party[0];
      moveItem(hero, quest.party, this.roster);
      hero.resetMutableStats();
    }

    // Send dead heroes to the graveyard
    while (quest.deceased.length) {
      moveItem(quest.deceased[0], quest.deceased, this.graveyard);
    }

    // Sell all sellables
    quest.items
      .filter((item) => item.info.isSellable)
      .forEach((item) => this.sellItem(item, quest.items));

    // Add remaining items to profile inventory
    quest.items.forEach(
      (item) => moveItem(item, quest.items, this.items)
    );

    // Rest quest status after escaping
    if (quest.status === QuestStatus.Escape) {
      quest.status = QuestStatus.Idle;
    }
  }

  recruitHero (hero: Hero) {
    if (!this.isRosterFull) {
      moveItem(hero, this.coach, this.roster);
    }
  }

  dismissHero (hero: Hero) {
    removeItem(this.roster, hero);
  }

  @action
  positionHeroInRoster (hero: Hero, newIndex: number) {
    const currentIndex = this.roster.indexOf(hero);
    if (currentIndex === -1) {
      throw new Error('Hero does not exist in roster');
    }

    this.roster.splice(currentIndex, 1); // Remove
    this.roster.splice(newIndex, 0, hero); // Insert
    this.roster.forEach((m, updatedIndex) => m.rosterIndex = updatedIndex);
  }

  sortHeroes (compareFn: (a: Hero, b: Hero) => number) {
    transaction(() => {
      this.roster = this.roster.sort(compareFn);
      this.roster.forEach((hero, index) => {
        hero.rosterIndex = index;
      });
    });
  }

  getStoreItems () {
    return StaticState.instance.items
      .filter((info) => info.getStoreCount)
      .reduce(
        (items, info) => {
          const num = info.getStoreCount(this.selectedQuest);
          const newItems = count(num).map(() => Item.fromInfo(info));
          return items.concat(newItems);
        },
        []
      );
  }

  @action
  gotoNextWeek () {
    this.week += 1;

    // Randomize estate event
    // TODO re-enable this when implementing estate events
    /*
    const eventIndex = Math.floor(100 * Math.random());
    const newEvent = new EstateEvent();
    newEvent.message = 'Event ' + eventIndex;
    this.estateEvent = newEvent;
    */

    // Randomize quests each week
    this.quests = [this.newQuest(), this.newQuest(), this.newQuest()];
    this.selectedQuestId = this.quests[0].id;

    // Randomize coach each week
    this.coach = [];
    count(this.coachSize).forEach(() =>
      this.coach.push(this.newHero())
    );

    this.processResidencyEffects();
  }

  newHero () {
    const startingLevel = this.getUpgradeEffects('coach').level;
    return generateHero([...this.roster, ...this.coach], startingLevel);
  }

  newQuest (dungeonPool = this.selectableDungeons, size?: MapSize) {
    return generateQuest(dungeonPool, this.difficulty, size);
  }
}
