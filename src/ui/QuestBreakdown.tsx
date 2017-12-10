import * as React from 'react';
import {css, StyleSheet} from 'aphrodite';
import {commonColors, commonStyleFn, Row} from '../config/styles';
import {CommonHeader} from './CommonHeader';
import {ItemIcon} from './ItemIcon';
import {Quest} from '../state/types/Quest';
import {Dungeon} from '../state/types/Dungeon';
import {grid} from '../config/Grid';
import {LargeHeader} from './LargeHeader';
import {MapSize} from '../state/types/QuestMap';

export class QuestBreakdown extends React.Component<{
  quest: Quest,
  dungeon: Dungeon
}> {
  render () {
    const quest = this.props.quest;
    return (
      <div className={css(styles.container)}>
        <LargeHeader
          classStyle={styles.header}
          label="Estate Map"
          icon={require('../assets/dd/images/campaign/town/quest_select/quest_select.icon.png')}
        />

        <Section label={quest.info.type} color={commonColors.bloodRed}>
          {quest.info.description}
        </Section>

        <Section
          label={`Level ${this.props.dungeon.level.number} | ${MapSize[quest.map.size]}`}
          color={commonColors.gray}>
          {quest.objective.description}
        </Section>

        <Section label="Rewards" color={commonColors.darkGold}>
          <Row>
            {quest.rewards.map((item) =>
              <ItemIcon classStyle={styles.reward} key={item.id} item={item}/>
            )}
          </Row>
        </Section>
      </div>
    );
  }
}

const Section = ({label, color, children}: any) => {
  return (
    <div>
      <CommonHeader label={label} color={color}/>
      <div className={css(styles.sectionContent)}>{children}</div>
    </div>
  );
};

export const questBreakdownWidth = grid.xSpan(3.5);
const styles = StyleSheet.create({
  container: {
    ...commonStyleFn.dock('left'),
    background: 'black',
    width: questBreakdownWidth,
    boxShadow: commonStyleFn.outerShadow(undefined, grid.gutter * 2)
  },

  header: {
    marginBottom: grid.gutter
  },

  sectionContent: {
    padding: grid.gutter * 2
  },

  reward: {
    marginRight: grid.gutter
  }
});
