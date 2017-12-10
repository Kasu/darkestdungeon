import * as React from 'react';
import {observer} from 'mobx-react';
import {AppStateComponent} from '../AppStateComponent';
import {HeroOverview} from '../ui/HeroOverview';
import {Row} from '../config/styles';
import {computed} from 'mobx';
import {CommonHeader} from '../ui/CommonHeader';
import {randomizeItem} from '../lib/Helpers';
import {Skill} from '../state/types/Skill';
import {contains} from '../lib/Helpers';
import {Hero} from '../state/types/Hero';
import {StyleSheet} from 'aphrodite';
import {Battler} from '../state/types/Battler';
import {SkillTargetObject} from '../state/types/SkillInfo';

@observer
export class BattleTester extends AppStateComponent {
  private reactionDisposers: Array<() => void>;
  private battler: Battler;

  @computed get teamA () {
    return this.activeProfile.selectedQuest.party.slice(0, 1);
  }

  @computed get teamB () {
    return this.activeProfile.selectedQuest.party.slice(1);
  }

  @computed get battleMembers () {
    return [...this.teamA, ...this.teamB];
  }

  componentWillMount () {
    this.battler = new Battler();
    this.reactionDisposers = this.battler.initialize(this.teamA);

    this.newTestBattle();
  }

  componentWillUnmount () {
    this.endTestBattle();
    this.reactionDisposers.forEach((dispose) => dispose());
  }

  render () {
    return (
      <div>
        <Row>
          {this.battleMembers.map((hero) => (
            <HeroOverview
              key={hero.id}
              hero={hero}
              classStyle={this.battler.turnActor === hero && styles.actor}
              onSkillSelected={(skill) => {
                if (this.battler.turnActor === hero) {
                  const enemyTeam = contains(this.teamA, hero) ? this.teamB : this.teamA;
                  const allyTeam = contains(this.teamA, hero) ? this.teamA : this.teamB;

                  const isAllySkill = skill.info.target.object === SkillTargetObject.Ally;
                  const targetTeam = isAllySkill ? allyTeam : enemyTeam;

                  this.act(skill, randomizeItem(targetTeam));
                }
              }}
            />
          ))}
        </Row>

        <Row>
          <button onClick={() => this.newTestBattle()}>New battle</button>
          <button onClick={() => this.endTestBattle()}>End battle</button>
        </Row>

        <div>
          <CommonHeader label="Battle Info"/>
          <div>
            Turn: {this.battler.turn}<br/>
            Actor: {this.battler.turnActorIndex}
          </div>
        </div>
      </div>
    );
  }

  newTestBattle () {
    this.battleMembers.forEach((m) => m.resetMutableStats());
    this.battler.startBattle(this.teamB);
  }

  endTestBattle () {
    this.battler.endBattle();
  }

  act (skill: Skill, target: Hero) {
    this.battler.performTurnAction(skill, [target]);
  }
}

const styles = StyleSheet.create({
  actor: {
    background: 'green'
  }
});
