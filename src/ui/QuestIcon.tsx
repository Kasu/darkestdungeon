import * as React from 'react';
import {Quest} from '../state/types/Quest';
import {css, StyleSheet} from 'aphrodite';
import {commonStyleFn, commonStyles} from '../config/styles';
import {grid} from '../config/Grid';
import {QuestType} from '../state/types/QuestInfo';
import {Icon} from './Icon';

const questTypeIcons = {
  [QuestType.Explore]: require('../assets/dd/images/campaign/town/quest_select/quest_select_explore_1.png'),
  [QuestType.Hunt]: require('../assets/dd/images/campaign/town/quest_select/quest_select_cleanse_5.png'),
  [QuestType.Free]: require('../assets/dd/images/campaign/town/quest_select/quest_select_gather_1.png')
};

const clickSound = {src: require('../assets/dd/audio/ui_town_dun_select.ogg'), volume: 0.6};

export class QuestIcon extends React.Component<{
  quest: Quest,
  isSelected: boolean,
  onSelected: () => void
}> {
  render () {
    return (
      <div className={css(styles.container, this.props.isSelected && styles.splash)}>
        <Icon
          src={questTypeIcons[this.props.quest.info.type]}
          clickSound={this.props.isSelected ? null : clickSound}
          highlight={this.props.isSelected ? null : undefined}
          classStyle={[commonStyles.fill, this.props.isSelected && styles.pulsate]}
          onClick={this.props.isSelected ? undefined : this.props.onSelected}
        />
      </div>
    );
  }
}

const pulsateKeyframes = {
  '0%': {transform: 'scale(1)'},
  '50%': {transform: 'scale(1.1)'},
  '100%': {transform: 'scale(1)'}
};

export const questIconSize = grid.ySpan(1);
const styles = StyleSheet.create({
  container: {
    width: questIconSize,
    height: questIconSize
  },

  splash: {
    ':before': {
      ...commonStyleFn.dock(undefined, -grid.ySpan(1)),
      ...commonStyleFn.singleBackground(),
      marginTop: -grid.gutter,
      marginLeft: -grid.gutter,
      content: '" "',
      backgroundImage: `url(${require('../assets/images/splash2.png')})`,
      pointerEvents: 'none'
    }
  },

  pulsate: {
    animationName: [pulsateKeyframes],
    animationDuration: '1s',
    animationIterationCount: 'infinite'
  }
});
