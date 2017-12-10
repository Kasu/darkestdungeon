import * as React from 'react';
import {BuildingOverview} from './BuildingOverview';
import {StaticState} from '../../../state/StaticState';
import {TreatmentFacility} from './treatment/TreatmentFacility';

export class Abbey extends React.Component {
  static id = 'abbey';

  render () {
    const info = StaticState.instance.buildings.get(Abbey.id);
    return (
      <BuildingOverview info={info}>
        <TreatmentFacility info={info}/>
      </BuildingOverview>
    );
  }
}
