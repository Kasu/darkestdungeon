import {identifier, serializable} from 'serializr';
import {IStatsSource, Stats} from './Stats';
import {BuildingInfoId} from './BuildingInfo';

export type QuirkId = string;

export class QuirkInfo implements IStatsSource {
  @serializable(identifier()) id: QuirkId;
  public name: string;
  public treatmentCostScale = 1.5;
  public stats: Stats = new Stats();
  public forcedTreatmentIds: BuildingInfoId[] = [];
  public bannedTreatmentIds: BuildingInfoId[] = [];
  public isDisease: boolean;
  public isAffliction: boolean;
  statsSourceName: string = 'Quirk';

  get isForcedOrBanned () {
    return this.forcedTreatmentIds.length > 0 || this.bannedTreatmentIds.length > 0;
  }

  get isPositive () {
    return !this.isForcedOrBanned && this.stats.isPositive;
  }

  get isNeutral () {
    return this.stats.isNeutral && !this.isForcedOrBanned;
  }

  get isNegative () {
    return this.isForcedOrBanned || this.stats.isNegative;
  }
}
