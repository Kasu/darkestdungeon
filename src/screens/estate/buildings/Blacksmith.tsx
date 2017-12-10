import * as React from 'react';
import {BuildingOverview} from './BuildingOverview';
import {StaticState} from '../../../state/StaticState';
import {HeroUpgradeShop, HeroUpgradeType} from './HeroUpgradeShop';

export class Blacksmith extends React.Component {
  static id = 'blacksmith';

  render () {
    const info = StaticState.instance.buildings.get(Blacksmith.id);
    return (
      <BuildingOverview coverupRight={false} info={info}>
        <HeroUpgradeShop type={HeroUpgradeType.Equipment} info={info}/>
      </BuildingOverview>
    );
  }
}
