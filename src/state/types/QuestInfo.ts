export enum QuestType {
  Hunt = 'Hunt',
  Explore = 'Explore',
  Free = 'Free'
}

export class QuestInfo {
  private constructor (
    public type: QuestType = QuestType.Free,
    public description: string = ''
  ) {}

  static hunt = new QuestInfo(
    QuestType.Hunt,
    `Test yourself in the mad realm of your fallen ancestor. ` +
    `Take revenge on those who have taken what is rightfully yours.`
  );
  static explore = new QuestInfo(
    QuestType.Explore,
    `Test yourself in the mad realm of your fallen ancestor. ` +
    `Take note of how the creatures have taken over, but don't delve too far.`
  );
  static free = new QuestInfo(
    QuestType.Free,
    `A moment of peace rests upon this realm. ` +
    `Take this opportunity to take back what is yours!`
  );
}
