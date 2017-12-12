import {computed, observable} from 'mobx';
import {StaticState} from '../StaticState';
import {identifier, list, map, object, primitive, reference, serializable} from 'serializr';
import {Experienced} from './Experienced';
import {CharacterClassInfo} from './CharacterClassInfo';
import {Item} from './Item';
import {QuirkInfo} from './QuirkInfo';
import {CharacterStatus} from './CharacterStatus';
import {SkillId, SkillTargetObject} from './SkillInfo';
import {Stats, TurnStats} from './Stats';
import {cap, contains, removeItem, without} from '../../lib/Helpers';
import {v4 as uuid} from 'uuid';
import {BuildingInfoId} from './BuildingInfo';
import {Skill} from './Skill';
import {ItemType} from './ItemInfo';
import {randomizeItem} from '../../lib/Helpers';

export type CharacterId = string;

export class Character extends Experienced {
  @serializable(identifier()) id: CharacterId = uuid();

  @serializable @observable name: string;

  @serializable(reference(CharacterClassInfo, StaticState.lookup((i) => i.classes)))
  classInfo: CharacterClassInfo;

  @serializable(reference(QuirkInfo, StaticState.lookup((i) => i.quirks)))
  affliction: QuirkInfo = null;

  @serializable(list(reference(QuirkInfo, StaticState.lookup((i) => i.quirks))))
  quirks: QuirkInfo[] = [];

  @computed get perks () {
    return Object.freeze(
      this.quirks.filter((q) => !q.isDisease && q.isPositive)
    );
  }

  @computed get flaws () {
    return Object.freeze(
      this.quirks.filter((q) => !q.isDisease && q.isNegative)
    );
  }

  @computed get diseases () {
    return Object.freeze(
      this.quirks.filter((q) => q.isDisease)
    );
  }

  @serializable(list(object(Item)))
  @observable
  items: Item[] = [];

  @serializable @observable hunger: number = 0;

  @serializable @observable classInfoStatsScale = 1;

  @serializable @observable buffSourceName: string;

  @serializable(object(TurnStats))
  @observable
  buff: TurnStats;

  @serializable(map(object(TurnStats)))
  @observable
  dots = new Map<CharacterStatus, TurnStats>();

  @serializable(object(Stats))
  @observable mutableStats = new Stats();

  @serializable(map(primitive()))
  @observable
  private skillLevels = new Map<SkillId, number>();

  @serializable(map(primitive()))
  @observable
  private skillSelections = new Map<SkillId, boolean>();

  get skills () {
    return this.classInfo.skills.map((info) => new Skill(this.skillLevels, this.skillSelections, info));
  }

  get selectedSkills () {
    return this.skills.filter((skill) => skill.isSelected);
  }

  @computed get scaledClassInfo () {
    const scaled = {...this.classInfo}; // Clone to avoid mutating static instance
    scaled.stats = new Stats();
    scaled.stats.add(this.classInfo.stats);
    scaled.stats.scale(this.classInfoStatsScale);
    return scaled;
  }

  @computed get armor () {
    return this.items.find((i) => i.info.type === ItemType.Armor);
  }

  @computed get weapon () {
    return this.items.find((i) => i.info.type === ItemType.Weapon);
  }

  @computed get trinkets () {
    return this.items.filter((i) => i.info.type === ItemType.Trinket);
  }

  @computed get stats () {
    const sum = new Stats();
    sum.add(this.scaledClassInfo);
    sum.add(this.mutableStats);

    if (this.buff) {
      sum.add(this.buff, {
        stats: new Stats(),
        name: this.buffSourceName,
        statsSourceName: this.buff.isPositive ? 'Buff' : 'Debuff'
      });
    }

    if (this.affliction) {
      sum.add(this.affliction);
    }

    this.quirks
      .forEach((source) => sum.add(source));

    this.items
      .forEach((source) => sum.add(source));

    return sum;
  }

  @computed get isAlive () {
    return this.stats.health.value > 0;
  }

  @computed get isDead () {
    return this.stats.health.value === 0;
  }

  acceptsTreatmentFrom (treatmentId: BuildingInfoId) {
    for (const quirk of this.quirks) {
      if (contains(quirk.bannedTreatmentIds, treatmentId)) {
        return false;
      }
    }

    const allForcedTreatmentIds = this.quirks.reduce(
      (all, q) => {
        all.push(...q.forcedTreatmentIds);
        return all;
      },
      []
    );

    if (allForcedTreatmentIds.length > 0) {
      return contains(allForcedTreatmentIds, treatmentId);
    }

    return true;
  }

  offsetStats (offset: Stats) {
    const updatedStats = new Stats();
    updatedStats.add(this.mutableStats);
    updatedStats.add(offset);
    this.mutableStats = updatedStats;
  }

  resetMutableStats () {
    const reset = new Stats();
    reset.health.value = this.stats.maxHealth.value;
    reset.stress.value = 100; // cap(reset.stress.value, 0, this.stats.maxStress.value / 2);
    this.mutableStats = reset;
    this.dots.clear();
    this.removeBuffs();
  }

  processTurn () {
    if (this.buff) {
      this.buff.turns -= 1;
      if (this.buff.turns <= 0) {
        this.removeBuffs();
      }
    }

    const memento = new Stats();

    this.dots.forEach((stats, status) => {
      const delta = this.applyStats(true, stats);

      // Add damage memento
      memento.add(delta);

      // Add status memento
      memento.statuses.get(status).value = 1;

      stats.turns -= 1;
      if (stats.turns <= 0) {
        this.dots.delete(status);
      }
    });

    return memento;
  }

  applyStats (isCrit: boolean, actionStats: Stats) {
    const targetStats = this.stats;

    // Calculate stats changes in the target
    const deltaStats = new Stats();

    // Reduce health by damage, ignoring protect for critical hits
    deltaStats.health.value += Math.min(
      0, (isCrit ? 0 : 1) * targetStats.protect.value - actionStats.damage.value
    );

    // Apply flat stress/health changes (ie. heals), double value for crits
    deltaStats.health.value += (isCrit ? 2 : 1) * actionStats.health.value;
    deltaStats.stress.value += (isCrit ? 2 : 1) * actionStats.stress.value;

    // Cap stress and health changes
    const minStressDelta = -targetStats.stress.value;
    const maxStressDelta = targetStats.maxStress.value - targetStats.stress.value;
    deltaStats.stress.value = cap(deltaStats.stress.value, minStressDelta, maxStressDelta);

    const minHealthDelta = -targetStats.health.value;
    const maxHealthDelta = targetStats.maxHealth.value - targetStats.health.value;
    deltaStats.health.value = cap(deltaStats.health.value, minHealthDelta, maxHealthDelta);

    deltaStats.round();

    this.offsetStats(deltaStats);

    return deltaStats;
  }

  replaceQuirk (newQuirk?: QuirkInfo) {
    if (newQuirk === undefined) {
      const newQuirksForHero = without(StaticState.instance.quirks, this.quirks);
      newQuirk = randomizeItem(newQuirksForHero);
    }

    let replacedQuirk;
    if (this.quirks.length) {
      replacedQuirk = randomizeItem(this.quirks);
      removeItem(this.quirks, replacedQuirk);
    }
    this.quirks.push(newQuirk);

    return {
      replacedQuirk,
      newQuirk
    };
  }

  applyBuff (buff: TurnStats, sourceName: string) {
    // TODO support multiple buffs
    const buffClone = new TurnStats();
    buffClone.turns = buff.turns;
    buffClone.add(buff);
    this.buffSourceName = sourceName;
    this.buff = buffClone;
  }

  removeBuffs () {
    this.buff = null;
    this.buffSourceName = null;
  }

  useSkill (skill: Skill, target: Character) {
    const targetStats = target.stats;

    // Turn character and skill stats into action stats
    const actionStats = new Stats();
    actionStats.add(this.stats.battle);
    actionStats.add(skill.stats);

    // Make accuracy and damage numbers slightly random
    const strength = 0.8 + Math.random () * 0.2;
    const precision = 0.8 + Math.random () * 0.2;
    actionStats.damage.value *= skill.damageScale * strength;
    actionStats.accuracy.value *= precision;
    actionStats.health.value *= strength;
    actionStats.stress.value *= strength;

    const isAllyTarget = skill.info.target.object === SkillTargetObject.Ally;
    const isCrit = Math.random() <= actionStats.criticalChance.value;
    const willBasicHit = isCrit || actionStats.accuracy.value > targetStats.dodge.value;
    const willBuffHit = Math.random() <= Character.getStatusHitChance(
      CharacterStatus.Buff, actionStats, targetStats
    );

    const willHit = isAllyTarget || willBasicHit;
    const memento = willHit ? target.applyStats(isCrit, actionStats) : new Stats();

    // Add crit memento
    if (isCrit) {
      memento.criticalChance.value = 1;
    }

    // Apply buff for this skill
    if (skill.buff && (isAllyTarget || willBuffHit)) {
      target.applyBuff(skill.buff, skill.info.name);

      // Add buff memento
      memento.statuses.get(CharacterStatus.Buff).value = 1;
    }

    // Apply status effects for this skill
    skill.stats.statuses.forEach((s, status) => {
      const willStatusHit = Math.random() <= Character.getStatusHitChance(status, actionStats, targetStats);
      if (!willStatusHit) {
        return;
      }

      const turnStats = new TurnStats();
      const damageScale = actionStats.statusDamageScales.get(status).value;
      turnStats.turns = skill.info.statusTurns;
      turnStats.damage.value = actionStats.damage.value * damageScale;
      turnStats.round();

      // Damage or stuns last over time
      if (turnStats.damage.value || status === CharacterStatus.Stun) {
        target.dots.set(status, turnStats);
      }

      // Add status memento
      memento.statuses.get(status).value = 1;
    });

    return memento;
  }

  applyItem (item: Item) {
    this.applyStats(false, item.stats);
    item.stats.statuses.forEach((value, status) => {
      this.dots.delete(status);
    });

    if (item.info.removeBuffs) {
      this.removeBuffs();
    }

    if (item.info.buff) {
      this.applyBuff(item.info.buff, item.name);
    }

    if (item.info.resetHunger) {
      this.hunger = 0;
    }
  }

  static getStatusHitChance (status: CharacterStatus, actionStats: Stats, targetStats: Stats) {
    const chance = actionStats.statuses.get(status).value;
    const resistance = targetStats.resistances.get(status).value;
    return chance - resistance;
  }
}
