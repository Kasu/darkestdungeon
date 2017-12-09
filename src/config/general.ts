import {StaticState} from "../state/StaticState";
import {DungeonInfo} from "../state/types/DungeonInfo";
import {LevelInfo} from "../state/types/LevelInfo";
import {CharacterClassInfo} from "../state/types/CharacterClassInfo";
import {HeirloomType, ItemInfo, ItemType} from "../state/types/ItemInfo";
import {QuirkInfo} from "../state/types/QuirkInfo";
import {CharacterStatus} from "../state/types/CharacterStatus";
import {SkillId, SkillInfo, SkillTarget, SkillTargetObject} from "../state/types/SkillInfo";
import {Stats, TurnStats} from "../state/types/Stats";
import {CharacterTemplate} from "../state/types/CharacterTemplate";
import {BuildingUpgradeInfo} from "../state/types/BuildingUpgradeInfo";
import {BuildingInfo, createId as createBuildingInfoId} from "../state/types/BuildingInfo";
import {StatItem} from "../state/types/StatItem";
import {gorillas, monkeys} from "./credits";

export const defaultAmbienceOSVolume = 0.25;

export const todo = "?todo?";

export const heroNameMinLength = 1;
export const heroNameMaxLength = 13;
export const recommendedFoodCount = 8;
export const maxSelectedSkills = 4;

export const equippableItems = new Map<ItemType, number>();
equippableItems.set(ItemType.Weapon, 1);
equippableItems.set(ItemType.Armor, 1);
equippableItems.set(ItemType.Trinket, 2);
export let maxEquippedItems = 0;
for (const count of equippableItems.values()) {
  maxEquippedItems += count;
}

const baseStatValue = 5;
const baseStatusChance = 0.4;
const baseStatusDamageScale = 0.2;
const baseResistance = 0.2;

const commonHeroNames = [...gorillas, ...monkeys];

function createStandardCharacterClass (className: string, statsScale = 1) {
  const info = new CharacterClassInfo();
  info.id = info.name = className;
  info.stats = new Stats();
  info.stats.maxHealth.value = 15 * baseStatValue;
  info.stats.maxStress.value = 200;
  info.stats.protect.value = 2 * baseStatValue;
  info.stats.damage.value = 2 * baseStatValue;
  info.stats.dodge.value = 2 * baseStatValue;
  info.stats.accuracy.value = 2 * baseStatValue;
  info.stats.speed.value = 2 * baseStatValue;
  info.stats.criticalChance.value = 0.05;

  for (const stat of info.stats.statuses.values()) {
    stat.value = baseStatusChance;
  }

  for (const stat of info.stats.resistances.values()) {
    stat.value = baseResistance;
  }

  info.stats.all.forEach((stat) => stat.value *= statsScale);

  return info;
}

export function addStaticState () {
  let previousLevelInfo: LevelInfo;
  ["Seeker", "Apprentice", "Pretty Cool", "Kickass", "Badass", "Master", "Grand Master"]
    .forEach((name, level) => {
      const info = new LevelInfo();
      info.id = level;
      info.number = level;
      info.name = name;
      info.experience = Math.pow(level, 2) * 1000;
      StaticState.instance.add((i) => i.levels, info);

      if (previousLevelInfo) {
        previousLevelInfo.next = info;
      }
      info.previous = previousLevelInfo;
      previousLevelInfo = info;
    });

  addSkills({
    // Backline support
    "Heal": {
      iconUrl: require("../assets/dd/images/raid/camping/skill_icons/camp_skill_abandon_hope.png"),
      position: SkillTarget.backline,
      target: SkillTarget.anyOne(SkillTargetObject.Ally),
      damageScale: 0,
      stats: {health: 2 * baseStatValue}
    },
    "Soothe": {
      iconUrl: require("../assets/dd/images/raid/camping/skill_icons/camp_skill_anger_management.png"),
      position: SkillTarget.backline,
      target: SkillTarget.anyOne(SkillTargetObject.Ally),
      damageScale: 0,
      stats: {stress: -2 * baseStatValue}
    },
    "Toughen": {
      iconUrl: require("../assets/dd/images/raid/camping/skill_icons/camp_skill_bandage.png"),
      position: SkillTarget.backline,
      target: SkillTarget.anyOne(SkillTargetObject.Ally),
      damageScale: 0,
      buff: {protect: 2 * baseStatValue}
    },
    "Empower": {
      iconUrl: require("../assets/dd/images/raid/camping/skill_icons/camp_skill_bandits_sense.png"),
      position: SkillTarget.backline,
      target: SkillTarget.anyOne(SkillTargetObject.Ally),
      damageScale: 0,
      buff: {damage: 2 * baseStatValue}
    },
    "Smite": {
      iconUrl: require("../assets/dd/images/raid/camping/skill_icons/camp_skill_bloody_shroud.png"),
      position: SkillTarget.backline,
      target: SkillTarget.oneOf([true, true, true, true]),
      stats: {
        statuses: {[CharacterStatus.Stun]: baseStatusChance}
      }
    },

    // Midline support
    "Break": {
      iconUrl: require("../assets/dd/images/raid/camping/skill_icons/camp_skill_battle_trance.png"),
      position: SkillTarget.midline,
      target: SkillTarget.anyOne(SkillTargetObject.Enemy),
      damageScale: 0,
      statusTurns: 1,
      buff: {protect: -2 * baseStatValue},
      stats: {
        statuses: {
          [CharacterStatus.Buff]: baseStatusChance
        }
      }
    },
    "Protect": {
      iconUrl: require("../assets/dd/images/raid/camping/skill_icons/camp_skill_bear_traps.png"),
      position: SkillTarget.midline,
      target: SkillTarget.anyOne(SkillTargetObject.Ally),
      damageScale: 0,
      buff: {protect: 2 * baseStatValue}
    },
    "Bolster": {
      iconUrl: require("../assets/dd/images/raid/camping/skill_icons/camp_skill_bless.png"),
      position: SkillTarget.midline,
      target: SkillTarget.anyOne(SkillTargetObject.Ally),
      damageScale: 0,
      buff: {protect: 2 * baseStatValue}
    },

    // Backline offensive
    "Holy Light": {
      iconUrl: require("../assets/dd/images/raid/camping/skill_icons/camp_skill_dark_strength.png"),
      position: SkillTarget.backline,
      target: SkillTarget.oneOf([true, true, true, true]),
      stats: {
        accuracy: baseStatValue,
        damage: baseStatValue
      }
    },
    "Poison Bomb": {
      iconUrl: require("../assets/dd/images/raid/camping/skill_icons/camp_skill_chant.png"),
      position: SkillTarget.backline,
      target: SkillTarget.oneOf([true, true, true, true]),
      stats: {
        statuses: {[CharacterStatus.Blight]: baseStatusChance},
        statusDamageScales: {[CharacterStatus.Blight]: baseStatusDamageScale}
      }
    },
    "Glass Bomb": {
      iconUrl: require("../assets/dd/images/raid/camping/skill_icons/camp_skill_dark_ritual.png"),
      position: SkillTarget.backline,
      target: SkillTarget.oneOf([true, true, true, true]),
      stats: {
        statuses: {[CharacterStatus.Bleed]: baseStatusChance},
        statusDamageScales: {[CharacterStatus.Bleed]: baseStatusDamageScale}
      }
    },
    "Artillery": {
      iconUrl: require("../assets/dd/images/raid/camping/skill_icons/camp_skill_experimental_vapours.png"),
      position: SkillTarget.backline,
      target: SkillTarget.oneOf([true, true, true, true]),
      stats: {
        accuracy: baseStatValue,
        damage: baseStatValue
      }
    },

    // Frontline offensive
    "Slash": {
      iconUrl: require("../assets/dd/images/raid/camping/skill_icons/camp_skill_clean_guns.png"),
      position: SkillTarget.frontline,
      target: SkillTarget.oneOf([false, false, true, true]),
      stats: {
        accuracy: baseStatValue,
        damage: baseStatValue
      }
    },
    "Swing": {
      iconUrl: require("../assets/dd/images/raid/camping/skill_icons/camp_skill_clean_musket.png"),
      position: SkillTarget.frontline,
      target: SkillTarget.oneOf([true, true, false, false]),
      stats: {
        accuracy: Math.round(baseStatValue / 3),
        damage: Math.round(baseStatValue * 2 / 3)
      }
    },
    "Heave": {
      iconUrl: require("../assets/dd/images/raid/camping/skill_icons/camp_skill_clean_musket.png"),
      position: SkillTarget.frontline,
      target: SkillTarget.oneOf([true, false, false, false]),
      stats: {
        damage: 2 * baseStatValue
      }
    },
    "Slam": {
      iconUrl: require("../assets/dd/images/raid/camping/skill_icons/camp_skill_clean_musket.png"),
      position: [false, false, false, true],
      target: SkillTarget.oneOf([true, false, false, false]),
      stats: {
        accuracy: -baseStatValue,
        damage: 3 * baseStatValue
      }
    }
  });

  addCharacterTemplates((i) => i.heroes, 1, commonHeroNames, {
    "White Mage": {
      classInfo: {
        avatarUrl: require("../assets/dd/images/heroes/leper/leper_A/leper_portrait_roster.png"),
        skills: ["Heal", "Soothe", "Toughen", "Empower", "Smite", "Holy Light", "Slash"]
      }
    },
    "Witch Doctor": {
      classInfo: {
        avatarUrl: require("../assets/dd/images/heroes/vestal/vestal_A/vestal_portrait_roster.png"),
        skills: ["Heal", "Poison Bomb", "Glass Bomb", "Break", "Bolster", "Slash", "Swing"]
      }
    },
    "Hunter": {
      classInfo: {
        avatarUrl: require(
          "../assets/dd/images/heroes/bounty_hunter/bounty_hunter_A/bounty_hunter_portrait_roster.png"
        ),
        skills: ["Artillery", "Toughen", "Break", "Protect", "Bolster", "Slash", "Swing"]
      }
    },
    "Crusader": {
      classInfo: {
        avatarUrl: require("../assets/dd/images/heroes/crusader/crusader_A/crusader_portrait_roster.png"),
        skills: ["Artillery", "Toughen", "Break", "Slash", "Swing", "Heave", "Slam"]
      }
    },

    "Master of Everything": {
      characterNames: ["Noob"],
      rarity: 0.1,
      unique: true,
      classInfo: {
        skills: ["Artillery", "Toughen", "Break", "Slash", "Swing", "Heave", "Slam"],
        avatarUrl: require(
          "../assets/dd/images/heroes/jester/jester_A/jester_portrait_roster.png"
        )
      }
    }
  });

  addCharacterTemplates((i) => i.monsters, 0.8, undefined, {
    "Skeleton": {
      classInfo: {
        skills: ["Slash", "Swing"]
      }
    },
    "Bat": {
      classInfo: {
        skills: ["Slash", "Swing"]
      }
    },
    "Ghost": {
      classInfo: {
        skills: ["Slash", "Swing"]
      }
    },
    "Snake": {
      classInfo: {
        skills: ["Slash", "Swing"]
      }
    },
    "Rat": {
      classInfo: {
        skills: ["Slash", "Swing"]
      }
    },
    "Destruction of Everything": {
      characterNames: ["jQuery"],
      rarity: 0.1,
      unique: true,
      classInfo: {
        avatarUrl: require("../assets/images/unicorn.jpg"),
        skills: ["Artillery", "Toughen", "Break", "Slash", "Swing", "Heave", "Slam"]
      }
    }
  });

  addDungeons({
    "The Old Road": {
      isStartingDungeon: true,
      imageUrl: require("../assets/dd/images/loading_screen/loading_screen.old_road.png"),
      entranceImageUrl: require("../assets/dd/images/dungeons/weald/weald.tutorial.room_wall.effigy_0.png"),
      roomImageUrls: [require("../assets/dd/images/dungeons/weald/weald.tutorial.room_wall.effigy_1.png")],
      monsters: ["Rat"]
    },
    "Ruins": {
      imageUrl: require("../assets/dd/images/loading_screen/loading_screen.crypts_0.png"),
      entranceImageUrl: require("../assets/dd/images/dungeons/crypts/crypts.entrance_room_wall.png"),
      roomImageUrls: [
        require("../assets/dd/images/dungeons/crypts/crypts.room_wall.altar.png"),
        require("../assets/dd/images/dungeons/crypts/crypts.room_wall.arch.png"),
        require("../assets/dd/images/dungeons/crypts/crypts.room_wall.barrels.png"),
        require("../assets/dd/images/dungeons/crypts/crypts.room_wall.drain.png"),
        require("../assets/dd/images/dungeons/crypts/crypts.room_wall.empty.png"),
        require("../assets/dd/images/dungeons/crypts/crypts.room_wall.entrance.png"),
        require("../assets/dd/images/dungeons/crypts/crypts.room_wall.library.png"),
        require("../assets/dd/images/dungeons/crypts/crypts.room_wall.torture.png")
      ],
      monsters: ["Snake"]
    },
    "Warrens": {
      imageUrl: require("../assets/dd/images/loading_screen/loading_screen.warrens_0.png"),
      entranceImageUrl: require("../assets/dd/images/dungeons/warrens/warrens.entrance_room_wall.png"),
      roomImageUrls: [
        require("../assets/dd/images/dungeons/warrens/warrens.room_wall.brickton.png"),
        require("../assets/dd/images/dungeons/warrens/warrens.room_wall.duct.png"),
        require("../assets/dd/images/dungeons/warrens/warrens.room_wall.effigy.png"),
        require("../assets/dd/images/dungeons/warrens/warrens.room_wall.ghetto.png"),
        require("../assets/dd/images/dungeons/warrens/warrens.room_wall.grate.png"),
        require("../assets/dd/images/dungeons/warrens/warrens.room_wall.meatlocker.png"),
        require("../assets/dd/images/dungeons/warrens/warrens.room_wall.shrine.png"),
        require("../assets/dd/images/dungeons/warrens/warrens.room_wall.sluice.png")
      ],
      monsters: ["Skeleton"]
    },
    "Weald": {
      imageUrl: require("../assets/dd/images/loading_screen/loading_screen.weald_0.png"),
      entranceImageUrl: require("../assets/dd/images/dungeons/weald/weald.entrance_room_wall.png"),
      roomImageUrls: [
        require("../assets/dd/images/dungeons/weald/weald.room_wall.clearing.png"),
        require("../assets/dd/images/dungeons/weald/weald.room_wall.corruptedcabin.png"),
        require("../assets/dd/images/dungeons/weald/weald.room_wall.crypt.png"),
        require("../assets/dd/images/dungeons/weald/weald.room_wall.gate.png"),
        require("../assets/dd/images/dungeons/weald/weald.room_wall.handtree.png"),
        require("../assets/dd/images/dungeons/weald/weald.room_wall.poisonriver.png"),
        require("../assets/dd/images/dungeons/weald/weald.room_wall.shroomland.png")
      ],
      monsters: ["Ghost"]
    },
    "Cove": {
      imageUrl: require("../assets/dd/images/loading_screen/loading_screen.cove_0.png"),
      entranceImageUrl: require("../assets/dd/images/dungeons/cove/cove.entrance_room_wall.png"),
      roomImageUrls: [
        require("../assets/dd/images/dungeons/cove/cove.room_wall.city.png"),
        require("../assets/dd/images/dungeons/cove/cove.room_wall.coral.png"),
        require("../assets/dd/images/dungeons/cove/cove.room_wall.grotto.png"),
        require("../assets/dd/images/dungeons/cove/cove.room_wall.handtree.png"),
        require("../assets/dd/images/dungeons/cove/cove.room_wall.shipwreck.png"),
        require("../assets/dd/images/dungeons/cove/cove.room_wall.temple.png"),
        require("../assets/dd/images/dungeons/cove/cove.room_wall.wallcrack.png"),
        require("../assets/dd/images/dungeons/cove/cove.room_wall.whale.png")
      ],
      monsters: ["Bat"]
    },
    "BTM's Dank Dungeon": {
      imageUrl: require("../assets/dd/images/loading_screen/loading_screen.plot_darkest_dungeon_1.png"),
      entranceImageUrl: require(
"../assets/dd/images/dungeons/darkestdungeon/quest_1/darkestdungeon.entrance_room_wall.plot_darkest_dungeon_1.png"
      ),
      roomImageUrls: [
        require("../assets/dd/images/dungeons/darkestdungeon/quest_1/darkestdungeon.room_wall.random01.png"),
        require("../assets/dd/images/dungeons/darkestdungeon/quest_1/darkestdungeon.room_wall.random02.png"),
        require("../assets/dd/images/dungeons/darkestdungeon/quest_1/darkestdungeon.room_wall.random03.png"),
        require("../assets/dd/images/dungeons/darkestdungeon/quest_1/darkestdungeon.room_wall.random04.png")
      ],
      monsters: ["Destruction of Everything"]
    }
  });

  addQuirks({
    "Speedster": {stats: {speed: 2 * baseStatValue, damage: -baseStatValue}},
    "Blood Thirsty": {stats: {damage: 2 * baseStatValue, accuracy: -baseStatValue}},
    "Quick Reflexes": {stats: {dodge: 2 * baseStatValue, speed: -baseStatValue}},

    "Short Sighted": {stats: {accuracy: -baseStatValue}},
    "Fatigue": {stats: {damage: -baseStatValue}},
    "Exhausted": {stats: {speed: -baseStatValue}},

    "The Plague": {
      isDisease: true,
      stats: {maxHealth: -2 * baseStatValue},
      forcedTreatmentIds: ["sanitarium.diseases"]
    },

    "Happy": {
      isAffliction: true,
      stats: {maxHealth: baseStatValue}
    },
    "Sad": {
      isAffliction: true,
      stats: {maxHealth: -baseStatValue}
    },

    "Known Cheat": {bannedTreatmentIds: ["tavern.gambling"]},
    "Nymphomania": {forcedTreatmentIds: ["tavern.brothel"]},
    "Recovering Alcoholic": {bannedTreatmentIds: ["tavern.bar"]}
  });

  addItems({
    // Heirlooms
    "Bust": {
      name: "Bust",
      pluralName: "Busts",
      iconUrl: require("../assets/dd/images/shared/estate/currency.bust.icon.png"),
      itemUrl: require("../assets/dd/images/panels/icons_equip/heirloom/inv_heirloom+bust.png"),
      type: ItemType.Heirloom,
      heirloomType: HeirloomType.Bust,
      value: 1,
      description: "Use for building upgrades"
    },
    "Portrait": {
      name: "Portrait",
      pluralName: "Portraits",
      iconUrl: require("../assets/dd/images/shared/estate/currency.portrait.icon.png"),
      itemUrl: require("../assets/dd/images/panels/icons_equip/heirloom/inv_heirloom+portrait.png"),
      type: ItemType.Heirloom,
      heirloomType: HeirloomType.Portrait,
      value: 2,
      description: "Use for building upgrades"
    },
    "Deed": {
      name: "Deed",
      pluralName: "Deeds",
      iconUrl: require("../assets/dd/images/shared/estate/currency.deed.icon.png"),
      itemUrl: require("../assets/dd/images/panels/icons_equip/heirloom/inv_heirloom+deed.png"),
      type: ItemType.Heirloom,
      heirloomType: HeirloomType.Deed,
      value: 3,
      description: "Use for building upgrades"
    },
    "Crest": {
      name: "Crest",
      pluralName: "Crests",
      iconUrl: require("../assets/dd/images/shared/estate/currency.crest.icon.png"),
      itemUrl: require("../assets/dd/images/panels/icons_equip/heirloom/inv_heirloom+crest.png"),
      type: ItemType.Heirloom,
      heirloomType: HeirloomType.Crest,
      value: 4,
      description: "Use for building upgrades"
    },

    // Store items
    "Food": {
      description: "Eat to restore health and starve off hunger.",
      itemUrl: require("../assets/dd/images/panels/icons_equip/provision/inv_provision+_2.png"),
      value: 75,
      sellValueScale: 0.25,
      getStoreCount: () => 18,
      resetHunger: true,
      stats: {
        health: 5
      }
    },
    "Shovel": {
      description: "Use to clear obstacles and break into things.",
      itemUrl: require("../assets/dd/images/panels/icons_equip/supply/inv_supply+shovel.png"),
      value: 250,
      sellValueScale: 0.25,
      getStoreCount: () => 4
    },
    "Antivenom": {
      description: "Use to counter blights, poisons and toxins.",
      itemUrl: require("../assets/dd/images/panels/icons_equip/supply/inv_supply+antivenom.png"),
      value: 150,
      sellValueScale: 0.25,
      getStoreCount: () => 6,
      stats: {
        statuses: {
          [CharacterStatus.Blight]: -1
        }
      }
    },
    "Bandages": {
      description: "Use to stanch the flow of bleeding.",
      itemUrl: require("../assets/dd/images/panels/icons_equip/supply/inv_supply+bandage.png"),
      value: 150,
      sellValueScale: 0.25,
      getStoreCount: () => 6,
      stats: {
        statuses: {
          [CharacterStatus.Bleed]: -1
        }
      }
    },
    "Herbs": {
      description: "Use to cleanse items and prevent maladies. " +
      "Can also be applied to a hero to eliminate combat debuffs.",
      itemUrl: require("../assets/dd/images/panels/icons_equip/supply/inv_supply+medicinal_herbs.png"),
      value: 200,
      sellValueScale: 0.25,
      getStoreCount: () => 6,
      removeBuffs: true
    },
    "Torch": {
      description: "Increases the light level.",
      itemUrl: require("../assets/dd/images/panels/icons_equip/supply/inv_supply+torch.png"),
      value: 75,
      sellValueScale: 0.25,
      getStoreCount: () => 18,
      offsetLight: 1
    },
    "Skeleton Key": {
      description: "Used to unlock strongboxes and doors.",
      itemUrl: require("../assets/dd/images/panels/icons_equip/supply/inv_supply+skeleton_key.png"),
      value: 200,
      sellValueScale: 0.25,
      getStoreCount: () => 6,
      offsetLight: 1
    },
    "Holy Water": {
      description: "Use to purge evil and restore purity. Can also be applied to a hero to increase resistances",
      itemUrl: require("../assets/dd/images/panels/icons_equip/supply/inv_supply+holy_water.png"),
      value: 150,
      sellValueScale: 0.25,
      getStoreCount: () => 6,
      buff: {
        resistances: {
          [CharacterStatus.Bleed]: baseResistance,
          [CharacterStatus.Blight]: baseResistance,
          [CharacterStatus.Buff]: baseResistance,
          [CharacterStatus.Disease]: baseResistance,
          [CharacterStatus.Move]: baseResistance,
          [CharacterStatus.Stun]: baseResistance,
          [CharacterStatus.Trap]: baseResistance
        }
      }
    },

    // Equipment

    "Brutal Hairpin": {
      description: "A ridiculously large hairpin once belonging to a giant",
      itemUrl: require("../assets/dd/images/panels/icons_equip/trinket/inv_trinket+brutal_hairpin.png"),
      value: 200,
      type: ItemType.Weapon,
      stats: {
        accuracy: baseStatValue,
        damage: 3 * baseStatValue
      }
    },

    "Spiked Club": {
      description: "A wooden club infused with metal spikes",
      itemUrl: require("../assets/dd/images/panels/icons_equip/trinket/inv_trinket+cudgel_weight.png"),
      value: 200,
      type: ItemType.Weapon,
      stats: {
        accuracy: 2 * baseStatValue,
        damage: 2 * baseStatValue
      }
    },

    "Metal Shield": {
      description: "A decorated shield made out of metal",
      itemUrl: require("../assets/dd/images/panels/icons_equip/trinket/inv_trinket+rampart_shield.png"),
      value: 200,
      type: ItemType.Armor,
      stats: {
        maxHealth: 2 * baseStatValue,
        protect: 2 * baseStatValue
      }
    },

    "Cloak of Swiftness": {
      description: "A cloak of mystical power that makes the wearer move with speed",
      itemUrl: require("../assets/dd/images/panels/icons_equip/trinket/inv_trinket+swift_cloak.png"),
      value: 200,
      type: ItemType.Armor,
      stats: {
        speed: 2 * baseStatValue,
        dodge: 2 * baseStatValue
      }
    },

    "Book of Rage": {
      description: "Feel the power of the dark side",
      itemUrl: require("../assets/dd/images/panels/icons_equip/trinket/inv_trinket+book_of_rage.png"),
      value: 400,
      type: ItemType.Trinket,
      stats: {
        dodge: -baseStatValue,
        damage: baseStatValue
      }
    },

    "Cursed Buckle": {
      description: "Protects its wearer at the cost of speed",
      itemUrl: require("../assets/dd/images/panels/icons_equip/trinket/inv_trinket+cursed_buckle.png"),
      value: 400,
      type: ItemType.Trinket,
      stats: {
        speed: -baseStatValue,
        protect: baseStatValue
      }
    }
  });

  addBuildings({
    abbey: {
      name: "Abbey",
      enterSound: {src: require("../assets/dd/audio/town_enter_abbey.ogg")},
      iconUrl: require("../assets/dd/images/campaign/town/buildings/abbey/abbey.icon_roster.png"),
      avatarUrl: require("../assets/dd/images/campaign/town/buildings/abbey/abbey.icon.png"),
      slotImageUrl: require("../assets/dd/images/campaign/town/buildings/abbey/abbey.locked_hero_slot_overlay.png"),
      backgroundUrl: require(
        "../assets/dd/images/campaign/town/buildings/abbey/abbey.character_background.png"
      ),
      children: {
        cloister: {
          name: "Cloister",
          useSound: {src: require("../assets/dd/audio/town_abbey_meditation.ogg")},
          avatarUrl: require("../assets/dd/images/campaign/town/buildings/abbey/abbey.meditation.icon.png"),
          description: "Peace through meditation",
          items: [
            {cost: null, effects: {size: 1, cost: 500}},
            {cost: {[HeirloomType.Deed]: 2, [HeirloomType.Crest]: 3}, effects: {recovery: 0.2}},
            {cost: {[HeirloomType.Deed]: 3, [HeirloomType.Crest]: 4}, effects: {size: 1}},
            {cost: {[HeirloomType.Deed]: 4, [HeirloomType.Crest]: 7}, effects: {cost: -100}},
            {cost: {[HeirloomType.Deed]: 6, [HeirloomType.Crest]: 8}, effects: {size: 1}},
            {cost: {[HeirloomType.Deed]: 12, [HeirloomType.Crest]: 16}, effects: {recovery: 0.2}}
          ]
        },
        transept: {
          name: "Transept",
          useSound: {src: require("../assets/dd/audio/town_abbey_prayer.ogg")},
          avatarUrl: require("../assets/dd/images/campaign/town/buildings/abbey/abbey.prayer.icon.png"),
          description: "Pray to a Higher Power",
          items: [
            {cost: null, effects: {size: 1, cost: 2500}},
            {cost: {[HeirloomType.Deed]: 3, [HeirloomType.Crest]: 4}, effects: {recovery: 0.2}},
            {cost: {[HeirloomType.Deed]: 6, [HeirloomType.Crest]: 8}, effects: {cost: -100}},
            {cost: {[HeirloomType.Deed]: 12, [HeirloomType.Crest]: 16}, effects: {recovery: 0.2}}
          ]
        },
        penance: {
          name: "Penance Hall",
          useSound: {src: require("../assets/dd/audio/town_abbey_flagellation.ogg")},
          avatarUrl: require("../assets/dd/images/campaign/town/buildings/abbey/abbey.flagellation.icon.png"),
          description: "Flagellation brings absolution",
          items: [
            {cost: null, effects: {size: 1, cost: 500}},
            {cost: {[HeirloomType.Deed]: 3, [HeirloomType.Crest]: 4}, effects: {recovery: 0.2}},
            {cost: {[HeirloomType.Deed]: 6, [HeirloomType.Crest]: 8}, effects: {cost: -100}},
            {cost: {[HeirloomType.Deed]: 12, [HeirloomType.Crest]: 16}, effects: {recovery: 0.2}}
          ]
        }
      }
    },
    blacksmith: {
      name: "Blacksmith",
      useSound: {src: require("../assets/dd/audio/town_blacksmith_purchase_wep.ogg"), volume: 0.7},
      enterSound: {src: require("../assets/dd/audio/town_enter_blacksmith.ogg")},
      avatarUrl: require("../assets/dd/images/campaign/town/buildings/blacksmith/blacksmith.icon.png"),
      npcImageUrl: require("../assets/dd/images/campaign/town/buildings/blacksmith/blacksmith.character.png"),
      npcBarks: [
        "Didn't expect you to come out of there again.",
        "This is shoddy equipment, but I can help with that. For a price that is.",
        "My equipment is top notch. At least no one ever came back to complain."
      ],
      backgroundUrl: require(
        "../assets/dd/images/campaign/town/buildings/blacksmith/blacksmith.character_background.png")
      ,
      children: {
        mastery: {
          name: "Smithing",
          avatarUrl: require("../assets/dd/images/campaign/town/buildings/blacksmith/blacksmith.weapon.icon.png"),
          description: "Allows upgrading equipment to higher levels",
          items: [
            {cost: null, effects: {cost: 1000, level: 1}},
            {cost: {[HeirloomType.Deed]: 1, [HeirloomType.Crest]: 2}, effects: {level: 1}},
            {cost: {[HeirloomType.Deed]: 2, [HeirloomType.Crest]: 3}, effects: {level: 1}},
            {cost: {[HeirloomType.Deed]: 3, [HeirloomType.Crest]: 4}, effects: {level: 1}},
            {cost: {[HeirloomType.Deed]: 4, [HeirloomType.Crest]: 5}, effects: {level: 1}}
          ]
        },
        training: {
          name: "Furnace",
          avatarUrl: require("../assets/dd/images/campaign/town/buildings/blacksmith/blacksmith.cost.icon.png"),
          description: "Reduces cost of upgrading equipment",
          items: [
            {cost: {[HeirloomType.Deed]: 1, [HeirloomType.Crest]: 2}, effects: {cost: -100}},
            {cost: {[HeirloomType.Deed]: 2, [HeirloomType.Crest]: 3}, effects: {cost: -100}},
            {cost: {[HeirloomType.Deed]: 3, [HeirloomType.Crest]: 4}, effects: {cost: -100}},
            {cost: {[HeirloomType.Deed]: 4, [HeirloomType.Crest]: 5}, effects: {cost: -100}},
            {cost: {[HeirloomType.Deed]: 5, [HeirloomType.Crest]: 6}, effects: {cost: -100}}
          ]
        }
      }
    },
    graveyard: {
      name: "Graveyard",
      enterSound: {src: require("../assets/dd/audio/town_enter_graveyard.ogg")},
      avatarUrl: require("../assets/dd/images/campaign/town/buildings/graveyard/graveyard.icon.png"),
      backgroundUrl: require(
        "../assets/dd/images/campaign/town/buildings/graveyard/graveyard.character_background.png"
      )
    },
    guild: {
      name: "Guild",
      useSound: {src: require("../assets/dd/audio/town_guild_purchase_skill.ogg"), volume: 0.5},
      enterSound: {src: require("../assets/dd/audio/town_enter_guild.ogg")},
      avatarUrl: require("../assets/dd/images/campaign/town/buildings/guild/guild.icon.png"),
      npcImageUrl: require("../assets/dd/images/campaign/town/buildings/guild/guild.character.png"),
      backgroundUrl: require(
        "../assets/dd/images/campaign/town/buildings/guild/guild.character_background.png"
      ),
      children: {
        mastery: {
          name: "Instructor Mastery",
          avatarUrl: require("../assets/dd/images/campaign/town/buildings/guild/guild.skill_levels.icon.png"),
          description: "Allows upgrading hero combat skills to higher ranks",
          items: [
            {cost: null, effects: {cost: 1000, level: 1}},
            {cost: {[HeirloomType.Deed]: 1, [HeirloomType.Crest]: 2}, effects: {level: 1}},
            {cost: {[HeirloomType.Deed]: 2, [HeirloomType.Crest]: 3}, effects: {level: 1}},
            {cost: {[HeirloomType.Deed]: 3, [HeirloomType.Crest]: 4}, effects: {level: 1}},
            {cost: {[HeirloomType.Deed]: 4, [HeirloomType.Crest]: 5}, effects: {level: 1}}
          ]
        },
        training: {
          name: "Training Regiment",
          avatarUrl: require("../assets/dd/images/campaign/town/buildings/guild/guild.cost.icon.png"),
          description: "Reduces cost of upgrading hero skills",
          items: [
            {cost: {[HeirloomType.Deed]: 1, [HeirloomType.Crest]: 2}, effects: {cost: -100}},
            {cost: {[HeirloomType.Deed]: 2, [HeirloomType.Crest]: 3}, effects: {cost: -100}},
            {cost: {[HeirloomType.Deed]: 3, [HeirloomType.Crest]: 4}, effects: {cost: -100}},
            {cost: {[HeirloomType.Deed]: 4, [HeirloomType.Crest]: 5}, effects: {cost: -100}},
            {cost: {[HeirloomType.Deed]: 5, [HeirloomType.Crest]: 6}, effects: {cost: -100}}
          ]
        }
      }
    },
    sanitarium: {
      name: "Sanitarium",
      enterSound: {src: require("../assets/dd/audio/town_enter_sanitarium.ogg")},
      iconUrl: require("../assets/dd/images/campaign/town/buildings/sanitarium/sanitarium.icon_roster.png"),
      avatarUrl: require("../assets/dd/images/campaign/town/buildings/sanitarium/sanitarium.icon.png"),
      npcImageUrl: require("../assets/dd/images/campaign/town/buildings/sanitarium/sanitarium.character.png"),
      npcBarks: [
        "I really don't know what to say. This is my first time here...",
        "Hi! I'm from a mysterious country...Have you ever been there?",
        "I can tell you one of my secrets."
      ],
      slotImageUrl: require(
        "../assets/dd/images/campaign/town/buildings/sanitarium/sanitarium.locked_hero_slot_overlay.png"
      ),
      backgroundUrl: require(
        "../assets/dd/images/campaign/town/buildings/sanitarium/sanitarium.character_background.png"
      ),
      children: {
        quirks: {
          name: "Treatment Ward",
          useSound: {src: require("../assets/dd/audio/town_sanitarium_treatment.ogg")},
          avatarUrl: require("../assets/dd/images/campaign/town/buildings/sanitarium/sanitarium.cost.icon.png"),
          description: "Treat Quirks and other problematic behaviors.",
          items: [
            {cost: null, effects: {size: 1, cost: 500, treatFlaw: 1}},
            {cost: {[HeirloomType.Deed]: 3, [HeirloomType.Crest]: 4}, effects: {size: 1}},
            {cost: {[HeirloomType.Deed]: 4, [HeirloomType.Crest]: 7}, effects: {cost: -100}},
            {cost: {[HeirloomType.Deed]: 6, [HeirloomType.Crest]: 8}, effects: {size: 1}}
          ]
        },
        diseases: {
          name: "Medical Ward",
          useSound: {src: require("../assets/dd/audio/town_sanitarium_disease.ogg")},
          avatarUrl: require(
            "../assets/dd/images/campaign/town/buildings/sanitarium/sanitarium.disease_quirk_cost.icon.png"
          ),
          description: "Treat Diseases, humours, and other physical maladies.",
          items: [
            {cost: null, effects: {size: 1, cost: 500, treatDisease: 1}},
            {cost: {[HeirloomType.Deed]: 3, [HeirloomType.Crest]: 4}, effects: {size: 1}},
            {cost: {[HeirloomType.Deed]: 4, [HeirloomType.Crest]: 7}, effects: {cost: -100}},
            {cost: {[HeirloomType.Deed]: 6, [HeirloomType.Crest]: 8}, effects: {size: 1}}
          ]
        }
      }
    },
    coach: {
      name: "Stage Coach",
      useSound: {src: require("../assets/dd/audio/town_stagecoach_purchase.ogg"), volume: 0.5},
      enterSound: {src: require("../assets/dd/audio/town_enter_coach.ogg")},
      avatarUrl: require("../assets/dd/images/campaign/town/buildings/stage_coach/stage_coach.icon.png"),
      npcImageUrl: require("../assets/dd/images/campaign/town/buildings/stage_coach/stage_coach.character.png"),
      backgroundUrl: require(
        "../assets/dd/images/campaign/town/buildings/stage_coach/stage_coach.character_background.png"
      ),
      description: "Upgrading the Stage Coach increases the available" +
      " heroes for hire each week or increases your roster size.",
      children: {
        network: {
          name: "Stagecoach Network",
          avatarUrl: require("../assets/dd/images/campaign/town/buildings/stage_coach/stage_coach.icon.png"),
          description: "Increases the number of recruits available for hire",
          items: [
            {cost: null, effects: {size: 2}},
            {cost: {[HeirloomType.Deed]: 3, [HeirloomType.Crest]: 4}, effects: {size: 2}},
            {cost: {[HeirloomType.Deed]: 6, [HeirloomType.Crest]: 8}, effects: {size: 2}},
            {cost: {[HeirloomType.Deed]: 12, [HeirloomType.Crest]: 16}, effects: {size: 2}}
          ]
        },
        roster: {
          name: "Hero Barracks",
          avatarUrl: require(
            "../assets/dd/images/campaign/town/buildings/stage_coach/stage_coach.rostersize.icon.png"
          ),
          description: "Increases the size of the hero roster",
          items: [
            {cost: null, effects: {size: 6}},
            {cost: {[HeirloomType.Deed]: 3, [HeirloomType.Crest]: 4}, effects: {size: 2}},
            {cost: {[HeirloomType.Deed]: 6, [HeirloomType.Crest]: 8}, effects: {size: 2}},
            {cost: {[HeirloomType.Deed]: 12, [HeirloomType.Crest]: 16}, effects: {size: 2}}
          ]
        },
        recruits: {
          name: "Experienced Recruits",
          avatarUrl: require(
            "../assets/dd/images/campaign/town/buildings/stage_coach/stage_coach.upgraded_recruits.icon.png"
          ),
          description: "Provides a chance of higher level recruits",
          items: [
            {cost: {[HeirloomType.Deed]: 3, [HeirloomType.Crest]: 4}, effects: {level: 1}},
            {cost: {[HeirloomType.Deed]: 6, [HeirloomType.Crest]: 8}, effects: {level: 1}},
            {cost: {[HeirloomType.Deed]: 12, [HeirloomType.Crest]: 16}, effects: {level: 1}}
          ]
        }
      }
    },
    tavern: {
      name: "Tavern",
      enterSound: {src: require("../assets/dd/audio/town_enter_tavern.ogg")},
      iconUrl: require("../assets/dd/images/campaign/town/buildings/tavern/tavern.icon_roster.png"),
      avatarUrl: require("../assets/dd/images/campaign/town/buildings/tavern/tavern.icon.png"),
      npcImageUrl: require("../assets/dd/images/campaign/town/buildings/tavern/tavern.character.png"),
      npcBarks: [
        "I Herd U Liek Mudkips",
        "I used to be a hero like you, then I took an arrow to the knee.",
        "Welcome to the Internet. I will be your guide."
      ],
      slotImageUrl: require(
        "../assets/dd/images/campaign/town/buildings/tavern/tavern.locked_hero_slot_overlay.png"
      ),
      backgroundUrl: require("../assets/dd/images/campaign/town/buildings/tavern/tavern.character_background.png"),
      description: "Upgrading the Tavern increases the number of available stress treatments and their effectiveness",
      children: {
        bar: {
          name: "Bar",
          useSound: {src: require("../assets/dd/audio/town_tavern_bar.ogg")},
          avatarUrl: require("../assets/dd/images/campaign/town/buildings/tavern/tavern.bar.icon.png"),
          description: "Improves the bar facilities",
          items: [
            {cost: null, effects: {size: 1, cost: 500}},
            {cost: {[HeirloomType.Deed]: 2, [HeirloomType.Crest]: 3}, effects: {recovery: 0.2}},
            {cost: {[HeirloomType.Deed]: 3, [HeirloomType.Crest]: 4}, effects: {size: 1}},
            {cost: {[HeirloomType.Deed]: 4, [HeirloomType.Crest]: 7}, effects: {cost: -100}},
            {cost: {[HeirloomType.Deed]: 6, [HeirloomType.Crest]: 8}, effects: {size: 1}},
            {cost: {[HeirloomType.Deed]: 12, [HeirloomType.Crest]: 16}, effects: {recovery: 0.2}}
          ]
        },
        gambling: {
          name: "Gambling",
          useSound: {src: require("../assets/dd/audio/town_tavern_gambling.ogg")},
          avatarUrl: require("../assets/dd/images/campaign/town/buildings/tavern/tavern.gambling.icon.png"),
          description: "Improves the gambling facilities",
          items: [
            {cost: null, effects: {size: 1, cost: 2500}},
            {cost: {[HeirloomType.Deed]: 3, [HeirloomType.Crest]: 4}, effects: {recovery: 0.2}},
            {cost: {[HeirloomType.Deed]: 6, [HeirloomType.Crest]: 8}, effects: {cost: -100}},
            {cost: {[HeirloomType.Deed]: 12, [HeirloomType.Crest]: 16}, effects: {recovery: 0.2}}
          ]
        },
        brothel: {
          name: "Brothel",
          useSound: {src: require("../assets/dd/audio/town_tavern_brothel_v1.ogg")},
          avatarUrl: require("../assets/dd/images/campaign/town/buildings/tavern/tavern.brothel.icon.png"),
          description: "Improves the brothel facilities",
          items: [
            {cost: null, effects: {size: 1, cost: 500}},
            {cost: {[HeirloomType.Deed]: 3, [HeirloomType.Crest]: 4}, effects: {recovery: 0.2}},
            {cost: {[HeirloomType.Deed]: 6, [HeirloomType.Crest]: 8}, effects: {cost: -100}},
            {cost: {[HeirloomType.Deed]: 12, [HeirloomType.Crest]: 16}, effects: {recovery: 0.2}}
          ]
        }
      }
    },
    provision: {
      name: "Provision",
      avatarUrl: require("../assets/dd/images/campaign/town/provision/provision.icon.png"),
      npcImageUrl: require("../assets/dd/images/campaign/town/provision/provision.character.png"),
      npcBarks: [
        "What do you want now?",
        "Oh god, it's you again...",
        "Go away, I'm busy!"
      ],
      backgroundUrl: require("../assets/dd/images/campaign/town/provision/provision.character_background.png")
    }
  });
}

function addCharacterTemplates (
  getList: (i: StaticState) => CharacterTemplate[],
  statsScale?: number, names?: string[], rawInfo?: any
) {
  for (const name in rawInfo) {
    // Define CharacterTemplate
    const {classInfo, ...templateProps} = rawInfo[name];
    const template = new CharacterTemplate(createStandardCharacterClass(name, statsScale), names);
    Object.assign(template, templateProps);

    // Define ClassInfo
    const {skills, stats, ...classInfoProps}: any = (classInfo || {});
    Object.assign(template.classInfo, classInfoProps);
    addStats(stats, template.classInfo.stats);
    template.classInfo.skills = (skills || []).map((skillId: SkillId) => {
      const skill = StaticState.instance.skills.find((s) => s.id === skillId);
      if (!skill) {
        throw new Error("No skill registered by id: " + skillId);
      }
      return skill;
    });

    StaticState.instance.add(getList, template);
    StaticState.instance.add((i) => i.classes, template.classInfo);
  }
}

function addBuildings (rawInfo: any, parent = StaticState.instance.buildingInfoRoot) {
  for (const key in rawInfo) {
    // Add to parent
    const info = new BuildingInfo();
    info.key = key;
    info.parent = parent;
    parent.children.set(key, info);

    // Assign props
    const {children, items, ...props} = rawInfo[key];
    Object.assign(info, props);

    // Parse raw items
    info.items = (items || []).map((rawItem: any, index: number) => {
      const {effects, cost} = rawItem;
      const item = new BuildingUpgradeInfo();
      item.id = createBuildingInfoId([info.id, index.toString()]);
      if (cost) {
        for (const heirloomName in cost) {
          item.cost.set(parseInt(heirloomName, 10) as HeirloomType, cost[heirloomName]);
        }
      }
      Object.assign(item.effects, effects);

      // Store item in static state list
      StaticState.instance.add((i) => i.buildingUpgrades, item);
      return item;
    });

    // Parse raw children
    if (children) {
      addBuildings(children, info);
    }
  }
}

function addDungeons (rawInfo: any) {
  for (const name in rawInfo) {
    const info = new DungeonInfo();
    info.id = name;
    info.name = name;

    const {monsters, ...props} = rawInfo[name];
    info.monsters = !monsters ? StaticState.instance.monsters :
      monsters.map((monsterId: SkillId) => {
        const monster = StaticState.instance.monsters.find((s) => s.id === monsterId);
        if (!monster) {
          throw new Error("No monster registered by id: " + monsterId);
        }
        return monster;
      });

    Object.assign(info, props);

    StaticState.instance.add((i) => i.dungeons, info);
  }
}

function addQuirks (rawInfo: any) {
  for (const name in rawInfo) {
    const info = new QuirkInfo();
    info.id = name;
    info.name = name;

    const {stats, ...props} = rawInfo[name];
    addStats(stats, info.stats);
    Object.assign(info, props);

    StaticState.instance.add((i) => i.quirks, info);
  }
}

function addSkills (rawInfo: any) {
  for (const name in rawInfo) {
    const info = new SkillInfo();
    info.id = name;
    info.name = name;

    const {stats, buff, ...props} = rawInfo[name];
    addStats(stats, info.stats);
    Object.assign(info, props);

    if (buff) {
      addStats(buff, info.buff = new TurnStats());
    }

    StaticState.instance.add((i) => i.skills, info);
  }
}

function addItems (rawInfo: any, defaultType = ItemType.Consumable) {
  for (const itemId in rawInfo) {
    const info = addItem(itemId, rawInfo[itemId]);
    if (info.type === undefined) {
      info.type = defaultType;
    }
  }
}

function addItem (itemId: string, rawInfo: any) {
  const info = new ItemInfo();
  info.id = itemId;
  info.name = itemId;
  info.pluralName = itemId;

  const {stats, buff, ...props} = rawInfo;
  Object.assign(info, props);
  addStats(stats, info.stats);
  info.buff = parseBuff(buff);

  StaticState.instance.add((i) => i.items, info);
  return info;
}

function addStats (rawStats: any, stats: Stats) {
  for (const statKey in rawStats) {
    const rawStat = rawStats[statKey];
    const realStat = (stats as any)[statKey];
    if (realStat instanceof StatItem) {
      realStat.value = rawStat;
    } else if (realStat instanceof Map) {
      realStat.forEach((stat: StatItem, key) => {
        if (rawStat.hasOwnProperty(key)) {
          stat.value = rawStat[key];
        }
      });
    } else if (stats.hasOwnProperty(statKey)) {
      (stats as any)[statKey] = rawStats[statKey];
    } else {
      throw new Error("Unknown Stats property: " + statKey);
    }
  }
}

function parseBuff (rawBuff: any) {
  if (!rawBuff) {
    return;
  }

  const buffStats = new TurnStats();
  rawBuff.turns = rawBuff.turns as number;
  addStats(rawBuff, buffStats);
  return buffStats;
}
