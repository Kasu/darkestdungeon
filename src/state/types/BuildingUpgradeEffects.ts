export class BuildingUpgradeEffects {
  size: number = 0;
  level: number = 0;
  cost: number = 0;
  recovery: number = 0;
  treatDisease: number = 0;
  treatFlaw: number = 0;

  add (other: BuildingUpgradeEffects) {
    const sum = new BuildingUpgradeEffects();
    sum.size = this.size + other.size;
    sum.level = this.level + other.level;
    sum.cost = this.cost + other.cost;
    sum.recovery = this.recovery + other.recovery;
    sum.treatDisease = this.treatDisease = other.treatDisease;
    sum.treatFlaw = this.treatFlaw = other.treatFlaw;
    return sum;
  }

  get hasTreatments () {
    return this.treatFlaw || this.treatDisease;
  }

  get treatmentArea () {
    if (this.hasTreatments) {
      return this.treatDisease ? 'Disease' : 'Quirk';
    }
  }
}
