import * as React from 'react';
import {BuildingOverview} from './BuildingOverview';
import {StaticState} from '../../../state/StaticState';
import {AppStateComponent} from '../../../AppStateComponent';
import {TreatmentFacility} from './treatment/TreatmentFacility';

export class Tavern extends AppStateComponent {
  static id = 'tavern';

  render () {
    const info = StaticState.instance.buildings.get(Tavern.id);
    return (
      <BuildingOverview info={info}>
        <TreatmentFacility info={info}/>
      </BuildingOverview>
    );
  }
}
