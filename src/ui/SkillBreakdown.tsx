import * as React from 'react';
import {SkillTargetObject} from '../state/types/SkillInfo';
import {commonStyles, Row} from '../config/styles';
import {css, StyleSheet} from 'aphrodite';
import {StatsTextList} from './StatsText';
import {CharacterStatus} from '../state/types/CharacterStatus';
import {PositionDots} from './PositionDots';
import {Skill} from '../state/types/Skill';
import {removeItem} from '../lib/Helpers';

export class SkillBreakdown extends React.Component<{
  skill: Skill
}> {
  renderPositions () {
    const values = PositionDots.getPositionValues([this.props.skill]).map((value) => value * 3);

    return (
      <PositionDots color="yellow" innerValues={values} size={7}/>
    );
  }

  renderTargets () {
    const skill = this.props.skill;
    const isSupport = skill.info.target.object === SkillTargetObject.Ally;
    const values = isSupport ?
      PositionDots.getSupportValues([skill]) :
      PositionDots.getHostileValues([skill]);

    const dotColor = isSupport ? 'green' : 'red';
    const dotInnerValues = values.map((value) => value * 3).reverse();

    return (
      <div className={css(styles.targets)}>
        <PositionDots color={dotColor} innerValues={dotInnerValues} size={7}/>
      </div>
    );
  }

  render () {
    const skill = this.props.skill;
    const displayedStats = skill.stats.nonNeutral.slice();
    const buffStat = skill.stats.statuses.get(CharacterStatus.Buff);

    // Remove buff from displayed stats since we're showing a specific section for skill buffs
    removeItem(
      displayedStats,
      displayedStats.find((stat) => stat.info.id === buffStat.info.id)
    );

    return (
      <div>
        <Row>
          {this.renderPositions()}
          {this.renderTargets()}
        </Row>
        <div className={css(commonStyles.positiveText)}>
          {skill.info.name}
        </div>

        <StatsTextList stats={displayedStats} long/>

        {skill.buff && (
          <div>
            <Row>
              {
                skill.buff.isPositive ?
                  <div className={css(commonStyles.positiveText)}>Buff</div> :
                  <div className={css(commonStyles.negativeText)}>Debuff</div>
              }
              {!buffStat.isNeutral && `(${buffStat.toString()})`}
            </Row>
            <StatsTextList stats={skill.buff.nonNeutral}/>
          </div>
        )}
      </div>
    );
  }
}

const styles = StyleSheet.create({
  targets: {
    flex: 1,
    alignItems: 'flex-end'
  }
});
