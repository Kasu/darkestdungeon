import * as React from 'react';
import {css, StyleSheet} from 'aphrodite';
import {StressMeter} from './StressMeter';
import {HealthMeter} from './HealthMeter';
import {TooltipArea} from '../lib/TooltipArea';
import {Character} from '../state/types/Character';
import {QuirkText} from './QuirkText';
import {StatsTextList} from './StatsText';
import {commonStyleFn, commonStyles} from '../config/styles';
import {observer} from 'mobx-react';
import {TurnStats} from '../state/types/Stats';

@observer
export class CharacterModel extends React.Component<{
  character: Character,
  highlight?: boolean,
  target?: boolean,
  classStyle?: any,
  onMouseEnter?: () => void,
  onMouseLeave?: () => void,
  onClick?: () => void,
  onRightClick?: () => void
}> {
  render () {
    const c = this.props.character;
    const dotBreakdowns: any[] = [];
    c.dots.forEach((stats, status) => {
      const name = stats.statuses.get(status).info.shortName;
      dotBreakdowns.push(
        <TurnBreakdown key={status} turnStats={stats} name={name} invert/>
      );
    });

    const targetIndicator = this.props.target && (
      <div className={css(styles.targetIndicator)}/>
    );

    return (
      <div
        className={css(
          styles.model, this.props.classStyle,
          this.props.highlight && styles.highlight
        )}
        onMouseLeave={this.props.onMouseLeave}
        onMouseEnter={this.props.onMouseEnter}
        onClick={this.props.onClick}
        onContextMenu={(e) => {
          e.preventDefault();
          if (this.props.onRightClick) {
            this.props.onRightClick();
          }
          return false;
        }}>
        <div>{c.name}</div>

        {c.affliction && (
          <QuirkText quirk={c.affliction}/>
        )}

        <TooltipArea
          tip={<HPAndStress character={c}/>}>
          <HealthMeter percentage={c.stats.healthPercentage}/>
          <StressMeter percentage={c.stats.stressPercentage}/>
        </TooltipArea>
        
        {c.buff && <TurnBreakdown turnStats={c.buff} name={c.buff.isPositive ? 'Buff' : 'Debuff'}/>}

        {dotBreakdowns}

        {targetIndicator}

        {this.props.children}
      </div>
    );
  }
}

class TurnBreakdown extends React.Component<{
  turnStats: TurnStats,
  name: string,
  invert?: boolean
}> {
  render () {
    const stats = this.props.turnStats;
    let isPositive = stats.isPositive;
    if (this.props.invert) {
      isPositive = !isPositive;
    }

    return (
      <TooltipArea
        tip={(
          <div>
            {
              <div className={css(isPositive ?
                commonStyles.positiveText :
                commonStyles.negativeText
              )}>
                {stats.turns} turns
              </div>
            }
            <StatsTextList stats={stats.nonNeutral}/>
          </div>
        )}>
        <div className={css(isPositive ?
          commonStyles.positiveText :
          commonStyles.negativeText
        )}>
          {this.props.name}
        </div>
      </TooltipArea>
    );
  }
}

class HPAndStress extends React.Component<{character: Character}> {
  render () {
    return (
      <div>
        <span className={css(commonStyles.nowrap)}>
          HP: {this.props.character.stats.health.value} / {this.props.character.stats.maxHealth.value}
        </span>
        <span className={css(commonStyles.nowrap)}>
          Stress: {this.props.character.stats.stress.value} / {this.props.character.stats.maxStress.value}
        </span>
      </div>
    );
  }
}

const targetHeight = 4;
const targetSpacing = 2;
const modelBorder = 2;
const styles = StyleSheet.create({
  model: {
    background: 'green',
    padding: 3,
    margin: 3,
    border: commonStyleFn.border(undefined, modelBorder)
  },

  highlight: {
    borderColor: 'gold'
  },

  targetIndicator: {
    position: 'absolute',
    bottom: -(targetHeight + targetSpacing + modelBorder), left: -modelBorder, right: -modelBorder,
    height: targetHeight,
    backgroundColor: 'red'
  }
});
