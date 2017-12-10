import {autorun, observable, reaction} from 'mobx';
import {Hero} from '../../state/types/Hero';
import {contains} from '../../lib/Helpers';
import {Quest} from '../../state/types/Quest';
import {Skill} from '../../state/types/Skill';
import {Character} from '../../state/types/Character';

export class DungeonSelections {
  // No need to serialize since it's automated by quest behavior
  @observable hero: Hero;
  @observable enemy: Character;
  @observable skill: Skill;

  selectHero (hero: Hero) {
    this.hero = hero;
  }

  selectEnemy (enemy: Character) {
    this.enemy = enemy;
  }

  selectSkill (skill: Skill) {
    this.skill = skill;
  }

  initialize (quest: Quest) {
    return [
      // Clean up enemy selection should it disappear
      autorun(() => {
        if (this.enemy && !contains(quest.enemies, this.enemy)) {
          this.enemy = null;
        }
      }),

      // Always keep a hero selected. Prioritize actor
      autorun(() => {
        if (quest.turnActor instanceof Hero) {
          this.selectHero(quest.turnActor);
        } else if (!this.hero && quest.party.length > 0) {
          this.selectHero(quest.party[0]);
        }
      }),

      // Change skill selection when changing hero
      // Select/Deselect skills when entering/leaving battle
      reaction(
        () => quest.inBattle && this.hero,
        (hero) => {
          this.selectSkill(
            hero && hero.selectedSkills.filter((s) =>
              s.info.canUse(this.hero, quest.allies, quest.enemies)
            )[0]
          );
        },
        true
      )
    ];
  }
}
