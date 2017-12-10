import {CharacterClassInfo} from './CharacterClassInfo';

export class CharacterTemplate {
  get id () { return this.classInfo.id; }

  constructor (
    public classInfo: CharacterClassInfo,
    public characterNames: string[] = [classInfo.name],
    public rarity: number = 1, // 0-1, lower means rarer
    public unique: boolean = false
  ) {}
}
