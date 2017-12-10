import * as React from 'react';
import {css, StyleSheet} from 'aphrodite';
import {EstateRosterEntry, rosterEntryHoverOffset, rosterEntryWidth} from './EstateRosterEntry';
import {observer} from 'mobx-react';
import {SortOptions} from '../../ui/SortOptions';
import {AppStateComponent} from '../../AppStateComponent';
import {Hero} from '../../state/types/Hero';
import {grid} from '../../config/Grid';
import {commonStyles, customScrollbarSize} from '../../config/styles';
import {IReactionDisposer, observable, reaction} from 'mobx';
import {DragDropSlot} from '../../lib/DragDropSlot';
import {BuildingMessage} from './buildings/BuildingMessage';
import {screenFooterHeight} from '../ScreenFooter';
import {Layer} from '../../ui/Layer';

const heroCompareIcons = {
  level: require('../../assets/dd/images/campaign/town/roster/roster_sort_level.png'),
  stress: require('../../assets/dd/images/campaign/town/roster/roster_sort_stress.png'),
  className: require('../../assets/dd/images/campaign/town/roster/roster_sort_class.png'),
  activity: require('../../assets/dd/images/campaign/town/roster/roster_sort_building.png')
};

const sounds = {
  activeHeroChanged: {src: require('../../assets/dd/audio/ui_town_char_rollover_03.ogg'), volume: 1.5}
};

@observer
export class EstateRoster extends AppStateComponent<{
  lineupFeatures?: boolean
}> {
  private stopReactingToEntries: IReactionDisposer;
  @observable heroShownInOverview: Hero;

  positionHero (droppedHero: Hero, slotHero: Hero) {
    this.activeProfile.positionHeroInRoster(
      droppedHero,
      this.activeProfile.roster.indexOf(slotHero)
    );
  }

  componentWillMount () {
    this.stopReactingToEntries = reaction(
      () => this.heroShownInOverview,
      () => this.appState.sfx.play(sounds.activeHeroChanged)
    );
  }

  componentWillUnmount () {
    this.stopReactingToEntries();
  }

  render () {
    const sortedHeroes = this.activeProfile.roster.slice().sort(Hero.comparers.rosterIndex);

    const emptyDropSlot = sortedHeroes.length === 0 && (
      <DragDropSlot
        type={Hero}
        allowDrag={() => false}
      >
        <BuildingMessage>
          Recruit new heroes in the Stage Coach
        </BuildingMessage>
      </DragDropSlot>
    );

    const roster = (
      <div className={css(styles.roster, this.appState.showGridOverlay && styles.gridOverlay)}>
        <div className={css(styles.header)}>
          <span className={css(styles.rosterSize, commonStyles.commonName)}>
            {this.activeProfile.roster.length} / {this.activeProfile.rosterSize}
          </span>
          <SortOptions
            comparers={Hero.visibleComparers}
            icons={heroCompareIcons}
            onChange={(fn) => this.activeProfile.sortHeroes(fn)}
          />
        </div>
        <ul className={css(styles.list, commonStyles.customScrollbar)}>
          {sortedHeroes.map((hero, index) => (
            <EstateRosterEntry
              key={hero.id + '-' + index}
              index={index}
              hero={hero}
              enableHoverOffset={true}
              lineupFeatures={this.props.lineupFeatures}
              isShownInOverview={this.heroShownInOverview === hero}
              onDrop={(droppedHero) => this.positionHero(droppedHero, hero)}
              onOverviewOpened={() => this.heroShownInOverview = hero}
              onOverviewClosed={() => this.heroShownInOverview = null}
            />
          ))}
          {emptyDropSlot}
        </ul>
      </div>
    );

    return roster;
  }
}

const styles = StyleSheet.create({
  roster: {
    zIndex: Layer.Roster,
    pointerEvents: 'all', // For portal
    position: 'absolute',
    top: grid.paddingTop,
    width: rosterEntryWidth + rosterEntryHoverOffset + customScrollbarSize,
    right: 0,
    bottom: grid.paddingBottom + screenFooterHeight
  },

  gridOverlay: {
    background: 'rgba(246, 41, 255, 0.75)'
  },

  header: {
    flexDirection: 'row',
    justifyContent: 'flex-end',
    alignItems: 'flex-end',
    height: grid.ySpan(1),

    paddingLeft: grid.xSpan(0.4),
    paddingRight: grid.paddingRight,
    paddingBottom: grid.gutter * 2 + grid.border,

    backgroundImage: `url(${require('../../assets/images/stick.png')})`,
    backgroundSize: 'contain',
    backgroundRepeat: 'no-repeat',
    backgroundPosition: '100% 100%'
  },

  rosterSize: {
    flex: 1
  },

  list: {
    flex: 1,
    overflowY: 'auto',
    overflowX: 'hidden',
    alignItems: 'flex-end'
  }
});
