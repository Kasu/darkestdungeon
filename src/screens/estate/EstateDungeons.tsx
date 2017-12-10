import * as React from 'react';
import {EstateTemplate} from './EstateTemplate';
import {Path} from '../../state/types/Path';
import {Alert, Prompt} from '../../ui/Popups';
import {observer} from 'mobx-react';
import {DungeonBreakdown} from '../../ui/DungeonBreakdown';
import {QuestBreakdown, questBreakdownWidth} from '../../ui/QuestBreakdown';
import {LineupDropbox} from '../../ui/LineupDropbox';
import {AppStateComponent} from '../../AppStateComponent';
import {Quest} from '../../state/types/Quest';
import {ItemType} from '../../state/types/ItemInfo';
import {css, StyleSheet} from 'aphrodite';
import {commonStyleFn} from '../../config/styles';
import {grid} from '../../config/Grid';

@observer
export class EstateDungeons extends AppStateComponent<{path: Path}> {
  groupQuestsByDungeon (quests: Quest[]) {
    return quests.reduce(
      (groups: any, quest) => {
        const list = groups[quest.dungeonId] || (groups[quest.dungeonId] = []);
        list.push(quest);
        return groups;
      },
      {} as {[key: string]: Quest[]}
    );
  }

  checkLineupBeforeContinue () {
    if (this.activeProfile.isLineupFull) {
      return Promise.resolve(true);
    }

    if (this.activeProfile.lineup.length === 0) {
      return this.appState.popups.prompt(
        <Alert message="Please form a party before embarking"/>
      );
    }

    if (!this.selectedQuest) {
      return this.appState.popups.prompt(
        <Alert message="Please select a quest before embarking"/>
      );
    }

    const availableHeroes = this.activeProfile.roster.filter((hero) =>
      !(hero.residentInfo && hero.residentInfo.isLockedIn)
    );

    let warningMessage;

    const maxLineupSize = Math.min(4, availableHeroes.length);
    if (this.activeProfile.lineup.length < maxLineupSize) {
      warningMessage = 'Do you wish to continue without a full contingent?';
    }

    const armorAvailable = this.activeProfile.items.find((i) => i.info.type === ItemType.Armor);
    const weaponAvailable = this.activeProfile.items.find((i) => i.info.type === ItemType.Weapon);
    const trinketAvailable = this.activeProfile.items.find((i) => i.info.type === ItemType.Trinket);
    const underpreparedHero = this.activeProfile.lineup.find((m) =>
      !!(
        (!m.armor && armorAvailable) || (!m.weapon && weaponAvailable) || (!m.trinkets.length && trinketAvailable)
      )
    );

    if (underpreparedHero) {
      warningMessage = `${underpreparedHero.name} does not have a full set of equipment. Do you wish to continue?`;
    }

    if (warningMessage) {
      return this.appState.popups.prompt(
        <Prompt
          query={'Grave danger awaits the underprepared. ' + warningMessage}
          yesLabel="Still Embark"
          noLabel="Cancel Embark"
        />
      );
    }

    return Promise.resolve(true);
  }

  render () {
    const questLookup = this.groupQuestsByDungeon(this.activeProfile.quests);
    return (
      <EstateTemplate
        background={require('../../assets/dd/images/campaign/town/quest_select/quest_select.background.png')}
        lineupFeaturesInRoster={true}
        path={this.props.path}
        backPath="estateOverview"
        continueCheck={() => this.checkLineupBeforeContinue()}
        continueSound={{src: require('../../assets/dd/audio/ui_town_button_provision.ogg'), volume: 0.7}}
        continueLabel="Provision"
        continuePath="estateProvision">
        <div className={css(styles.content)}>
          <div className={css(styles.dungeons)}>
            {this.activeProfile.selectableDungeons.map((d) =>
              <DungeonBreakdown
                key={d.id}
                classStyle={styles.dungeon}
                name={d.info.name}
                level={d.level.number}
                progress={d.levelProgress}
                quests={questLookup[d.id]}
                selectedQuestId={this.activeProfile.selectedQuestId}
                onQuestSelected={(quest) => this.activeProfile.selectedQuestId = quest.id}
              />
            )}
          </div>
        </div>
        {this.selectedQuest && (
          <QuestBreakdown
            quest={this.selectedQuest}
            dungeon={this.selectedDungeon}
          />
        )}
        <LineupDropbox profile={this.activeProfile}/>
      </EstateTemplate>
    );
  }
}

const styles = StyleSheet.create({
  content: {
    ...commonStyleFn.dock(),
    marginLeft: questBreakdownWidth + grid.xSpan(0.5),
    justifyContent: 'center'
  },

  dungeons: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    justifyContent: 'center'
  },

  dungeon: {
    marginBottom: grid.ySpan(1)
  }
});
