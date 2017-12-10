import * as React from 'react';
import {BuildingOverview} from './BuildingOverview';
import {StaticState} from '../../../state/StaticState';
import {TreatmentFacility} from './treatment/TreatmentFacility';

export class Sanitarium extends React.Component {
  static id = 'sanitarium';

  render () {
    const info = StaticState.instance.buildings.get(Sanitarium.id);
    return (
      <BuildingOverview info={info}>
        <TreatmentFacility info={info}/>
      </BuildingOverview>
    );
  }
}
