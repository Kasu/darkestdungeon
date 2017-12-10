import * as React from 'react';
import {BuildingOverview} from './BuildingOverview';
import {AppStateComponent} from '../../../AppStateComponent';
import {EstateRosterEntry} from '../EstateRosterEntry';
import {observer} from 'mobx-react';
import {StaticState} from '../../../state/StaticState';
import {css, StyleSheet} from 'aphrodite';
import {HorizontalDivider} from '../../../ui/HorizontalDivider';
import {BuildingMessage} from './BuildingMessage';
import {Hero} from '../../../state/types/Hero';
import {grid} from '../../../config/Grid';
import {commonStyles} from '../../../config/styles';

@observer
export class StageCoach extends AppStateComponent {
  static id = 'coach';

  get buildingInfo () {
    return StaticState.instance.buildings.get(StageCoach.id);
  }

  renderMessage () {
    if (this.activeProfile.coach.length === 0) {
      return (
        <BuildingMessage>
          All heroes have been recruited. <br/>
          New recruits will arrive next week.
        </BuildingMessage>
      );
    }

    if (this.activeProfile.isRosterFull) {
      return (
        <BuildingMessage style={{marginBottom: grid.ySpan(1)}}>
          The Hero Barracks is full. <br/>
          You can upgrade the barracks at the Stage Coach.
        </BuildingMessage>
      );
    }
  }

  recruitHero (newHero: Hero) {
    this.activeProfile.recruitHero(newHero);
    if (this.buildingInfo.useSound) {
      this.appState.sfx.play(this.buildingInfo.useSound);
    }
  }

  render () {
    const lastIndex = this.activeProfile.coach.length - 1;
    const elements: React.ReactNode[] = [];

    this.activeProfile.coach.forEach((hero, index) => {
      elements.push(
        <EstateRosterEntry
          key={hero.id}
          hero={hero}
          transparent={true}
          onDragEnd={(draggedHero, monitor) => monitor.didDrop() && this.recruitHero(draggedHero)}
          allowDrag={() => !this.activeProfile.isRosterFull}
          allowDrop={() => false}
        />
      );

      if (index !== lastIndex) {
        elements.push(
          <HorizontalDivider key={'divider' + index}/>
        );
      }
    });

    return (
      <BuildingOverview coverupRight={false} info={this.buildingInfo}>
        <div className={css(styles.coachList, commonStyles.customScrollbar)}>
          {this.renderMessage()}
          {elements}
        </div>
      </BuildingOverview>
    );
  }
}

const styles = StyleSheet.create({
  coachList: {
    alignItems: 'flex-end',
    overflowY: 'auto',
    overflowX: 'hidden',
    flex: 1
  }
});
