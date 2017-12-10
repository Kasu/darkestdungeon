import * as React from 'react';
import {Quest, QuestStatus} from '../state/types/Quest';
import {observer} from 'mobx-react';
import {TooltipArea} from '../lib/TooltipArea';
import {LargeHeader} from './LargeHeader';
import {Icon} from './Icon';
import {Row} from '../config/styles';
import {grid} from '../config/Grid';
import {css, StyleSheet} from 'aphrodite';

@observer
export class QuestHeader extends React.Component<{
  quest: Quest,
  onRetreatRequested: () => void
  onLeaveRequested: (status: QuestStatus) => void,
  classStyle?: any
}> {
  renderLeaveButton () {
    if (this.props.quest.inBattle) {
      return (
        <button onClick={this.props.onRetreatRequested}>
          Retreat from combat
        </button>
      );
    }

    if (this.props.quest.isObjectiveMet) {
      return (
        <button onClick={() => this.props.onLeaveRequested(QuestStatus.Victory)}>
          Return to Town
        </button>
      );
    }

    if (this.props.quest.isEscapable) {
      return (
        <button onClick={() => this.props.onLeaveRequested(QuestStatus.Escape)}>
          Escape
        </button>
      );
    }
  }

  render () {
    return (
      <div className={css(this.props.classStyle)}>
        <LargeHeader classStyle={styles.header}>
          <Row>
            <Icon
              classStyle={styles.headerIcon}
              src={require('../assets/dd/images/overlays/quest_log.png')}
            />
            <TooltipArea tip={this.props.quest.objective.description}>
              {this.props.quest.info.type}
            </TooltipArea>
          </Row>
        </LargeHeader>
        {this.renderLeaveButton()}
      </div>
    );
  }
}

const styles = StyleSheet.create({
  header: {
    fontSize: grid.fontSize(0.75)
  },

  headerIcon: {
    width: grid.ySpan(0.75),
    height: grid.ySpan(0.75),
    marginRight: grid.gutter
  }
});
