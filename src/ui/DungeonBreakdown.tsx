import * as React from 'react';
import {Column, commonColors, commonStyleFn, Row} from '../config/styles';
import {questIconSize, QuestIcon} from './QuestIcon';
import {Quest, QuestId} from '../state/types/Quest';
import {css, StyleSheet} from 'aphrodite';
import {fonts} from '../assets/fonts';

export class DungeonBreakdown extends React.Component<{
  name: string,
  level: number,
  progress: number,
  quests: Quest[],
  selectedQuestId: QuestId,
  onQuestSelected: (q: Quest) => void,
  classStyle?: any
}> {
  static defaultProps: any = {
    quests: []
  };

  render () {
    return (
      <div className={css(this.props.classStyle)}>
        <Row classStyle={styles.progress}>
          <Column classStyle={styles.left}>
            <span className={css(styles.name)}>{this.props.name}</span>
            <span className={css(styles.progressBar)}>
              <span
                className={css(styles.progressFill)}
                style={{width: (this.props.progress) * 100 + '%'}}
              />
            </span>
          </Column>
          <span className={css(styles.level)}>{this.props.level}</span>
        </Row>
        <Row classStyle={styles.quests}>
          {this.props.quests.map((quest) =>
            <QuestIcon
              key={quest.id}
              quest={quest}
              isSelected={this.props.selectedQuestId === quest.id}
              onSelected={() => this.props.onQuestSelected(quest)}
            />
          )}
        </Row>
      </div>
    );
  }
}

const styles = StyleSheet.create({
  progress: {
    backgroundImage: `url(${require('../assets/dd/images/campaign/town/quest_select/dungeon_progressionbar.png')})`,
    backgroundSize: 'cover',
    backgroundRepeat: 'no-repeat',
    height: 84,
    width: 282
  },

  left: {
    flex: 1
  },

  level: {
    width: 70,
    marginTop: 33,
    paddingLeft: 5
  },

  name: {
    height: 39,
    fontFamily: fonts.Darkest,
    color: commonColors.gold,
    paddingRight: 15,
    paddingBottom: 5,
    alignItems: 'flex-end',
    justifyContent: 'flex-end'
  },

  progressBar: {
    paddingTop: 3,
    paddingLeft: 12,
    paddingBottom: 3,
    height: 13
  },

  progressFill: {
    flex: 1,
    background: commonStyleFn.shineGradient(commonColors.red)
  },

  quests: {
    marginTop: -31,
    height: questIconSize
  }
});
