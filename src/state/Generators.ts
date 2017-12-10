import {StaticState} from './StaticState';
import {Hero} from './types/Hero';
import {Item} from './types/Item';
import {Dungeon} from './types/Dungeon';
import {Quest} from './types/Quest';
import {MapSize, QuestMap} from './types/QuestMap';
import {QuestObjective} from './types/QuestObjective';
import {Character} from './types/Character';
import {CharacterTemplate} from './types/CharacterTemplate';
import {randomizeItem, randomizeItems, without} from '../lib/Helpers';
import {maxSelectedSkills} from '../config/general';
import {ItemType} from './types/ItemInfo';
import {Curio} from './types/Curio';
import {TurnStats} from './types/Stats';
import {getBestSkillSet} from './types/Skill';
import {Difficulty} from './types/Difficulty';

export function generateMonster (dungeon: Dungeon, activeMonsters: Character[]): Character {
  const template = randomizeTemplate(dungeon.info.monsters, activeMonsters);
  return decorateCharacter(new Character(), activeMonsters, template, dungeon.level.number);
}

export function generateHero (activeHeroes: Hero[], level = 0): Hero {
  const allTemplates = StaticState.instance.heroes;
  const template = randomizeTemplate(allTemplates, activeHeroes);

  return decorateCharacter(new Hero(), activeHeroes, template, level);
}

export function decorateCharacter<T extends Character> (
  c: T, activeCharacters: T[], template: CharacterTemplate, level: number
): T {
  // Determine available names
  const takenNames = activeCharacters.map((a) => a.name);
  let availableNames = without(template.characterNames, takenNames);
  if (availableNames.length === 0) {
    availableNames = template.characterNames;
  }

  c.name = randomizeItem(availableNames);
  c.classInfo = template.classInfo;
  c.affliction = Math.random() > 0.5 ? randomizeItem(StaticState.instance.afflictions) : null;
  c.quirks = randomizeItems(StaticState.instance.quirks, 1, 4);

  const allItems = StaticState.instance.items;
  const weapons = allItems.filter((item) => item.type === ItemType.Weapon);
  const armors = allItems.filter((item) => item.type === ItemType.Armor);

  c.items = [
    Item.fromInfo(randomizeItem(weapons)),
    Item.fromInfo(randomizeItem(armors))
  ];

  const selectedSkills = getBestSkillSet(c.skills, maxSelectedSkills);
  selectedSkills.forEach((skill) => {
    skill.level += 1;
    skill.isSelected = true;
  });

  c.experience = StaticState.instance.levels.find((l) => l.number === level).experience;

  c.resetMutableStats();
  return c;
}

export function generateCurio (): Curio {
  const curio = new Curio();
  const type = Math.floor(Math.random() * 2.999);
  const isPositive = Math.random() > 0.5;

  switch (type) {
    // Items
    case 0:
      curio.items = randomizeItems(StaticState.instance.items, 1, 3).map(Item.fromInfo);
      break;

    // Buff
    case 1:
      curio.buff = generateBuff(isPositive ? 1 : -1);
      break;

    // Quirks
    case 2:
      curio.replaceQuirk = true;
      break;
  }

  return curio;
}

export function generateBuff (multiplier: number) {
  const buff = new TurnStats();
  buff.resistances.forEach((stat) => {
    stat.value = multiplier * 0.1;
  });
  return buff;
}

export function generateQuest (dungeons: Dungeon[], difficulty: Difficulty, size?: MapSize): Quest {
  if (size === undefined) {
    size = randomizeItem([MapSize.Short, MapSize.Medium, MapSize.Long]);
  }

  const q = new Quest();
  const dungeon = randomizeItem(dungeons);
  q.dungeonId = dungeon.id;
  q.bonfires = Math.round(Math.random() * 2);
  q.map = QuestMap.generate(dungeon, difficulty, size);
  q.changeRoom(q.map.entrance.id);

  const allRewards = StaticState.instance.items.filter((info) => info.isReward);
  q.rewards = randomizeItems(allRewards, 1, 4).map(Item.fromInfo);

  const o = new QuestObjective();
  if (Math.random() > 0.5) {
    o.monsterPercentage = 0.1 + Math.random() * 0.9;
    o.explorePercentage = 0.1 + Math.random() * 0.9;
  } else {
    o.monsterPercentage = 0.1 + Math.random() * 0.9;
  }
  q.objective = o;
  return q;
}

export function randomizeTemplate (allTemplates: CharacterTemplate[], activeCharacters: Character[]) {
  const activeTemplates = activeCharacters.map(
    (h) => allTemplates.find((t) => t.classInfo.id === h.classInfo.id)
  );

  // Filter out any templates marked as unique that already is active
  let templatePool = allTemplates.filter((t) => {
    return !activeTemplates.find(
      (active) => active.id === t.id && active.unique
    );
  });

  if (templatePool.length === 0) {
    console.warn(`All templates taken, can't produce a fulfilling template. Falling back to any template.`);
    templatePool = allTemplates;
  }

  // Randomize order so we can pick the first rarity match and still have randomness
  templatePool.sort(() => Math.random () > 0.5 ? -1 : 1);

  // Find rarity match
  const rarityScore = Math.random();
  const rareMatch = templatePool.find((t) => rarityScore <= t.rarity);
  if (rareMatch) {
    return rareMatch;
  }
  return templatePool.find((t) => rarityScore >= t.rarity);
}
