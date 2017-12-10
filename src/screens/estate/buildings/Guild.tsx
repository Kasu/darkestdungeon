import * as React from 'react';
import {BuildingOverview} from './BuildingOverview';
import {StaticState} from '../../../state/StaticState';
import {HeroUpgradeShop, HeroUpgradeType} from './HeroUpgradeShop';

export class Guild extends React.Component {
  static id = 'guild';

  render () {
    const info = StaticState.instance.buildings.get(Guild.id);
    return (
      <BuildingOverview coverupRight={false} info={info}>
        <HeroUpgradeShop type={HeroUpgradeType.Skills} info={info}/>
      </BuildingOverview>
    );
  }
}
