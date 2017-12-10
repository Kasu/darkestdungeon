import * as React from 'react';
import {css, StyleSheet} from 'aphrodite';
import {TooltipArea} from '../lib/TooltipArea';
import {SkillBreakdown} from './SkillBreakdown';
import {Skill} from '../state/types/Skill';
import {observer} from 'mobx-react';
import {commonColors, commonStyleFn, commonStyles} from '../config/styles';
import {grid} from '../config/Grid';
import {Icon} from './Icon';

@observer
export class SkillIcon extends React.Component<{
  skill: Skill,
  isEnabled?: boolean,
  isSelected?: boolean,
  classStyle?: any,
  clickSound?: IHowlProperties,
  onClick?: () => void
}> {
  static defaultProps = {
    isEnabled: true
  };

  render () {
    const lockSymbol = this.props.skill.level === 0 && (
      <Icon size={grid.ySpan(1)} src={require('../assets/dd/images/shared/character/lockedskill.png')}/>
    );

    const isSelected = this.props.isSelected !== undefined ?
      this.props.isSelected :
      this.props.skill.isSelected;

    const selectionIndicator = isSelected && (
      <div className={css(styles.selectionIndicator)}/>
    );

    const disabledIndicator = !this.props.isEnabled && (
      <div className={css(styles.disabledIndicator)}/>
    );

    const levelIndicator = (
      <span className={css(styles.levelIndicator)}>
        {this.props.skill.level}
      </span>
    );

    return (
      <Icon
        src={this.props.skill.info.iconUrl}
        classStyle={[styles.container, this.props.classStyle]}
        clickSound={this.props.clickSound}
        onClick={this.props.isEnabled ? this.props.onClick : undefined}
      >
        <TooltipArea
          classStyle={commonStyles.dock}
          tip={<SkillBreakdown skill={this.props.skill}/>}
        >
          {lockSymbol}
          {levelIndicator}
          {selectionIndicator}
          {disabledIndicator}
        </TooltipArea>
      </Icon>
    );
  }
}

const styles = StyleSheet.create({
  container: {
    ...commonStyleFn.singleBackground(),
    background: 'rgb(0, 0, 60)',
    opacity: 0.8,
    width: grid.ySpan(1),
    height: grid.ySpan(1),

    justifyContent: 'center',
    alignItems: 'center',

    ':hover': {
      opacity: 1
    }
  },

  selectionIndicator: {
    position: 'absolute',
    top: 0, right: 0, bottom: 0, left: 0,
    border: commonStyleFn.border(commonColors.gold),
    boxShadow: commonStyleFn.innerShadow()
  },

  levelIndicator: {
    position: 'absolute',
    bottom: -grid.ySpan(0.4) - grid.gutter,
    textAlign: 'center',
    fontSize: grid.fontSize(0.4),
    fontWeight: 'normal',
    textShadow: commonStyleFn.textShadow('black', grid.border),
    color: commonColors.gold
  },

  disabledIndicator: {
    position: 'absolute',
    top: 0, right: 0, bottom: 0, left: 0,
    background: 'rgba(0, 0, 0, 0.5)'
  }
});
