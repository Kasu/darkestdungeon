import {serializable} from 'serializr';

export class QuestObjective {
  @serializable explorePercentage: number = 0;
  @serializable monsterPercentage: number = 0;

  get description () {
    const strings: string[] = [];
    if (this.monsterPercentage > 0) {
      strings.push(`Slay ${(this.monsterPercentage * 100).toFixed(0)}% of monsters`);
    }
    if (this.explorePercentage > 0) {
      strings.push(`Explore ${(this.explorePercentage * 100).toFixed(0)}% of rooms`);
    }
    return strings.join(' and ');
  }
}
