import {observable} from "mobx";
import {StatItem} from "./StatItem";
import {CharacterStatus} from "./CharacterStatus";
import {map, serializable} from "serializr";
import {enumMap} from "../../lib/Helpers";

export interface IStatsSource {
  stats: Stats;
  name: string;
  statsSourceName: string;
  hasBaseStats?: boolean;
}

export class StatMod {
  constructor (
    public source: IStatsSource,
    public stat: StatItem
  ) {}
}

function declareStatuses (shortSuffix: string, longSuffix: string) {
  const statItems = new Map<CharacterStatus, StatItem>();
  enumMap<CharacterStatus>(CharacterStatus).forEach((status, name) => {
    statItems.set(status, StatItem.declare(name + shortSuffix, name + longSuffix, true));
  });
  return statItems;
}

export class Stats {
  @serializable(StatItem.serializr())
  public health = StatItem.declare("Health", "Health Points");

  @serializable(StatItem.serializr())
  public stress = StatItem.declare("Stress", "Stress Points");

  @serializable(StatItem.serializr())
  public maxHealth = StatItem.declare("Max HP", "Max Health Points");

  @serializable(StatItem.serializr())
  public maxStress = StatItem.declare("Max Stress", "Max Stress Points");

  @serializable(StatItem.serializr())
  public dodge = StatItem.declare("Dge", "Dodge");

  @serializable(StatItem.serializr())
  public protect = StatItem.declare("Prt", "Protect");

  @serializable(StatItem.serializr())
  public speed = StatItem.declare("Spd", "Speed");

  @serializable(StatItem.serializr())
  public accuracy = StatItem.declare("Acc", "Accuracy");

  @serializable(StatItem.serializr())
  public criticalChance = StatItem.declare("Crt", "Critical Hit Chance", true);

  @serializable(StatItem.serializr())
  public damage = StatItem.declare(" Dmg", " Damage");

  @serializable(map(StatItem.serializr()))
  public resistances = declareStatuses(" Res", " Resistance");

  @serializable(map(StatItem.serializr()))
  public statuses = declareStatuses("", " Chance");

  @serializable(map(StatItem.serializr()))
  public statusDamageScales = declareStatuses(" Dmg", " Damage Modifier");

  get battle () {
    return [this.dodge, this.protect, this.speed, this.accuracy, this.criticalChance, this.damage];
  }

  get base () {
    return [this.maxHealth, this.maxStress, ...this.battle];
  }

  get all () {
    return [
      this.health, this.stress,
      ...this.base,
      ...Array.from(this.resistances.values()),
      ...Array.from(this.statuses.values()),
      ...Array.from(this.statusDamageScales.values())
    ];
  }

  get nonNeutral () {
    return this.all.filter((s) => !s.isNeutral);
  }

  get isNeutral () {
    return this.sum === 0;
  }

  get isPositive () {
    return this.sum > 0;
  }

  get isNegative () {
    return this.sum < 0;
  }

  get sum () {
    return this.nonNeutral.reduce((sum, stat) => sum + stat.value, 0);
  }

  get stressPercentage () {
    return this.stress.value / this.maxStress.value;
  }

  get healthPercentage () {
    return this.health.value / this.maxHealth.value;
  }

  add (addition: Stats | IStatsSource | StatItem[], source: IStatsSource = null) {
    let otherItems: StatItem[];
    if (Array.isArray(addition)) {
      otherItems = addition as StatItem[];
    } else if (addition instanceof Stats) {
      otherItems = addition.all;
    } else {
      otherItems = (addition as IStatsSource).stats.all;
      source = (addition as IStatsSource);
    }

    for (const otherItem of otherItems) {
      const thisItem = this.all.find((i) => i.info.id === otherItem.info.id);
      if (!otherItem.isNeutral) {
        thisItem.value += otherItem.value;
        if (source) {
          thisItem.mods.push(new StatMod(source, otherItem));
        }
      }
    }
  }

  scale (scale: number) {
    for (const item of this.all) {
      item.value *= scale;
    }
  }

  round () {
    this.all.forEach((stat) => {
      if (!stat.info.isPercentage) {
        stat.value = Math.round(stat.value);
      }
    });
  }
}

export class TurnStats extends Stats {
  @serializable @observable public turns: number = 3;
}
