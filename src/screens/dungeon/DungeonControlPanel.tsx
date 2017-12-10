import * as React from 'react';
import {Column, commonStyleFn, commonStyles, Row} from '../../config/styles';
import {DungeonCharacterSummary} from './DungeonCharacterSummary';
import {css, StyleSheet} from 'aphrodite';
import {Inventory} from '../../ui/Inventory';
import {observable} from 'mobx';
import {observer} from 'mobx-react';
import {DungeonMap} from './DungeonMap';
import {ItemType} from '../../state/types/ItemInfo';
import {Quest} from '../../state/types/Quest';
import {DungeonSelections} from './DungeonSelections';
import {grid} from '../../config/Grid';
import {Icon} from '../../ui/Icon';

@observer
export class DungeonControlPanel extends React.Component<{
  quest: Quest,
  selections: DungeonSelections,
  classStyle?: any
}> {
  @observable isMapVisible = false;

  renderSideContent () {
    if (this.props.selections.enemy) {
      return <DungeonCharacterSummary character={this.props.selections.enemy}/>;
    }

    if (this.isMapVisible) {
      return <DungeonMap quest={this.props.quest}/>;
    }

    return (
      <Inventory
        heroes={this.props.quest.party}
        items={this.props.quest.items}
        isEnabled={!this.props.quest.inBattle || this.props.quest.canHeroAct}
        onItemRightClick={(item) => {
          if (item.info.type === ItemType.Consumable) {
            this.props.quest.useItem(item, this.props.selections.hero);
          }
        }}
      />
    );
  }

  render () {
    const quest = this.props.quest;
    const selections = this.props.selections;
    return (
      <div className={css(styles.controlPanel, this.props.classStyle)}>
        <Row>
          <Column classStyle={styles.controlPanelBox}>
            {selections.hero && (
              <DungeonCharacterSummary
                character={selections.hero}
                selectedSkill={selections.skill}
                enableSkill={(skill) =>
                  quest.inBattle && quest.canHeroAct && skill.info.canUse(
                    quest.turnActor, quest.allies, quest.enemies
                  )
                }
                onSkillClicked={(skill) => {
                  if (skill) {
                    selections.selectSkill(skill);
                  } else if (quest.canHeroAct) {
                    quest.passTurnAction();
                  }
                }}
              />
            )}
          </Column>
          <Column classStyle={styles.controlPanelBox}>
            <Row classStyle={commonStyles.fill}>
              <Column>
                {this.renderSideContent()}
              </Column>
              <div className={css(styles.sideMenu)}>
                <Icon
                  width={grid.xSpan(0.5)}
                  height={grid.ySpan(2)}
                  src={require('../../assets/dd/images/scrolls/use_inventory.png')}
                  onClick={() => this.isMapVisible = false}
                />
                <Icon
                  width={grid.xSpan(0.5)}
                  height={grid.ySpan(2)}
                  src={require('../../assets/dd/images/panels/icons_equip/trinket/inv_trinket+ancestors_map.png')}
                  onClick={() => this.isMapVisible = true}
                />
              </div>
            </Row>
          </Column>
        </Row>
      </div>
    );
  }
}

const styles = StyleSheet.create({
  controlPanel: {
    background: 'black'
  },

  controlPanelBox: {
    border: commonStyleFn.border(),
    margin: 2,
    padding: 2
  },

  sideMenu: {
    borderLeft: '2px solid gray',
    paddingLeft: 2,
    width: 50
  }
});
