import {BuildingInfoId} from './BuildingInfo';
import {observable} from 'mobx';
import {serializable} from 'serializr';
import {QuirkId} from './QuirkInfo';

export class HeroResidentInfo {
  @serializable @observable buildingId: BuildingInfoId;
  @serializable @observable slotIndex: number;
  @serializable @observable isLockedIn: boolean;
  @serializable @observable treatmentId: QuirkId;
}
