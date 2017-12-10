import * as React from 'react';
import {Hero} from '../../../state/types/Hero';
import {observable} from 'mobx';
import {observer} from 'mobx-react';
import {HeroUpgradeGrid} from './HeroUpgradeGrid';
import {BuildingInfo} from '../../../state/types/BuildingInfo';
import {EstateRosterEntry} from '../EstateRosterEntry';
import {DragDropSlot} from '../../../lib/DragDropSlot';
import {BuildingMessage} from './BuildingMessage';
import {grid} from '../../../config/Grid';

export enum HeroUpgradeType {
  Skills,
  Equipment
}

@observer
export class HeroUpgradeShop extends React.Component<{
  type: HeroUpgradeType,
  info: BuildingInfo
}> {
  @observable selectedHero: Hero;

  render () {
    return (
      <div>
        <div style={{marginBottom: grid.gutter}}>
          <SlotOrHero hero={this.selectedHero} onChange={(hero) => this.selectedHero = hero}/>
        </div>
        {this.selectedHero && (
          <HeroUpgradeGrid
            type={this.props.type}
            info={this.props.info}
            hero={this.selectedHero}
          />
        )}
      </div>
    );
  }
}

class SlotOrHero extends React.Component<{
  hero: Hero,
  onChange: (hero?: Hero) => void
}> {
  renderContent () {
    if (this.props.hero) {
      return (
        <EstateRosterEntry
          allowDrop={() => false}
          onDragEnd={() => this.props.onChange(null)}
          hero={this.props.hero}
        />
      );
    }

    return (
      <BuildingMessage>
        Drag a hero from the roster here
      </BuildingMessage>
    );
  }

  render () {
    return (
      <DragDropSlot
        type={Hero}
        item={this.props.hero}
        allowDrag={() => false}
        allowDrop={(hero: Hero) => !(hero.residentInfo && hero.residentInfo.isLockedIn)}
        onDrop={this.props.onChange}>
        {this.renderContent()}
      </DragDropSlot>
    );
  }
}
