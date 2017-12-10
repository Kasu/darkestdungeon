import * as React from 'react';
import {observer} from 'mobx-react';
import {css, StyleSheet} from 'aphrodite';
import {DungeonControlPanel} from './DungeonControlPanel';
import {Torch} from '../../ui/Torch';
import {QuestHeader} from '../../ui/QuestHeader';
import {DungeonScene} from './DungeonScene';
import {AppStateComponent} from '../../AppStateComponent';
import {QuestStatus} from '../../state/types/Quest';
import {Alert, Prompt} from '../../ui/Popups';
import {ModalState, PopupAlign} from '../../state/PopupState';
import {HeroOverview} from '../../ui/HeroOverview';
import {Hero} from '../../state/types/Hero';
import {DungeonSelections} from './DungeonSelections';
import {grid} from '../../config/Grid';

@observer
export class DungeonOverview extends AppStateComponent {
  private reactionDisposers: Array<() => void>;
  private selections = new DungeonSelections();

  componentWillMount () {
    this.reactionDisposers = [
      ...this.selectedQuest.initialize(),
      ...this.selections.initialize(this.selectedQuest),
      this.selectedQuest.whenVictorious(
        () => this.endQuestPopup(QuestStatus.Victory)
      ),
      this.selectedQuest.whenPartyWipes(
        () => this.endQuestPopup(QuestStatus.Defeat)
      )
    ];
  }

  componentWillUnmount () {
    this.reactionDisposers.forEach((dispose) => dispose());
  }

  async endQuestPopup (status: QuestStatus) {
    let promise;
    switch (status) {
      case QuestStatus.Defeat:
        promise = this.appState.popups.prompt(
          <Alert message="You have been defeated. Returning to town."/>
        ).then(() => true);
        break;
      case QuestStatus.Escape:
        promise = this.appState.popups.prompt(
          <Prompt query="Escape this dungeon and return to town?"/>
        );
        break;
      case QuestStatus.Victory:
        promise = this.appState.popups.prompt(
          <Prompt query="You are victorious! Return to town now?"/>
        );
        break;
    }

    const proceed = await promise;
    if (proceed) {
      this.endQuest(status);
    }
  }

  async battleRetreatPopup () {
    const proceed = await this.appState.popups.prompt(
      <Prompt query={'Are you sure you want to retreat from this battle?'}/>
    );

    if (proceed) {
      this.selectedQuest.retreatFromBattle();
    }
  }

  showHeroOverview (hero: Hero) {
    this.appState.popups.show({
      align: PopupAlign.TopLeft,
      position: {x: 0, y: 0},
      modalState: ModalState.Opaque,
      id: 'heroOverview',
      content: (
        <HeroOverview
          hero={hero}
          enableSkillSelection={() => !this.selectedQuest.inBattle}
        />
      )
    });
  }

  render () {
    return (
      <div className={css(styles.container)}>
        <DungeonScene
          classStyle={styles.scene}
          quest={this.selectedQuest}
          dungeon={this.selectedDungeon}
          selections={this.selections}
          onHeroOverviewRequested={this.showHeroOverview.bind(this)}
        />

        <DungeonControlPanel
          classStyle={styles.controlPanel}
          quest={this.selectedQuest}
          selections={this.selections}
        />

        <QuestHeader
          classStyle={styles.questHeader}
          quest={this.selectedQuest}
          onRetreatRequested={this.battleRetreatPopup.bind(this)}
          onLeaveRequested={this.endQuestPopup.bind(this)}
        />

        <Torch classStyle={styles.torch} quest={this.selectedQuest}/>
      </div>
    );
  }

  endQuest (status?: QuestStatus) {
    this.selectedQuest.status = status;
    this.appState.router.goto('dungeonResult');
  }
}

const styles = StyleSheet.create({
  container: {
    flex: 1
  },

  questHeader: {
    position: 'absolute',
    top: grid.paddingTop,
    left: grid.paddingLeft
  },

  torch: {
    position: 'absolute',
    alignSelf: 'center'
  },

  scene: {
    flex: 1
  },

  controlPanel: {
    height: grid.ySpan(5)
  }
});
