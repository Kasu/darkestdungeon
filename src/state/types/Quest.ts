import {identifier, list, object, serializable} from 'serializr';
import {v4 as uuid} from 'uuid';
import {QuestMap} from './QuestMap';
import {QuestObjective} from './QuestObjective';
import {Item} from './Item';
import {autorun, computed, intercept, observable, reaction, when} from 'mobx';
import {QuestInfo} from './QuestInfo';
import {DungeonId} from './Dungeon';
import {MapLocationId} from './QuestRoom';
import {cap, moveItem, removeItem} from '../../lib/Helpers';
import {Hero} from './Hero';
import {Battler} from './Battler';

export type QuestId = string;

export class Quest extends Battler<Hero> {
  @serializable(identifier()) id: QuestId = uuid();
  @serializable bonfires: number = 0;
  @serializable dungeonId: DungeonId;
  @serializable isEscapable?: boolean = true;

  @serializable(object(QuestMap))
  map: QuestMap;

  @serializable(object(QuestObjective))
  objective: QuestObjective = new QuestObjective();

  @serializable(list(object(Item)))
  rewards: Item[] = [];

  @serializable(list(object(Hero)))
  @observable
  party: Hero[] = [];

  @serializable(list(object(Hero)))
  @observable
  deceased: Hero[] = [];

  // Data that changes throughout a quest
  @serializable @observable status: QuestStatus = QuestStatus.Idle;
  @serializable @observable light: number = 100;
  @serializable(list(object(Item))) @observable items: Item[] = [];
  @serializable @observable previousRoomId: MapLocationId = null;
  @serializable @observable currentRoomId: MapLocationId = null;

  @computed get lightPercentage () {
    return cap(this.light / 100, 0, 1);
  }

  @computed get previousRoom () {
    return this.map.rooms.find((room) => room.id === this.previousRoomId);
  }

  @computed get currentRoom () {
    return this.map.rooms.find((room) => room.id === this.currentRoomId);
  }

  @computed get explorePercentage () {
    const scoutedRooms = this.map.rooms.filter((room) => room.isScouted);
    return scoutedRooms.length / this.map.rooms.length;
  }

  @computed get monsterPercentage () {
    const allMonsters = this.map.rooms.reduce(
      (reduction, room) => {
        reduction.push(...room.monsters);
        return reduction;
      },
      [...this.enemies, ...this.deceasedEnemies]
    );

    const deadMonsters = allMonsters.filter((monster) => monster.isDead);
    return deadMonsters.length / allMonsters.length;
  }

  @computed get isObjectiveMet () {
    return this.explorePercentage >= this.objective.explorePercentage &&
      this.monsterPercentage >= this.objective.monsterPercentage;
  }

  get info (): QuestInfo {
    if (this.objective.monsterPercentage) {
      return QuestInfo.hunt;
    }
    if (this.objective.explorePercentage) {
      return QuestInfo.explore;
    }
    return QuestInfo.free;
  }

  changeRoom (roomId: MapLocationId) {
    this.previousRoomId = this.currentRoomId;
    this.currentRoomId = roomId;
    this.currentRoom.isScouted = true;
  }

  canChangeToRoom (roomId: MapLocationId) {
    if (this.inBattle) {
      return false;
    }

    const requestedRoom = this.map.rooms.find((room) => room.id === roomId);
    return this.currentRoom.isConnectedTo(requestedRoom);
  }

  retreatFromBattle () {
    this.changeRoom(this.previousRoomId);
  }

  useItem (item: Item, targetHero: Hero) {
    this.applyItem(item); // Apply quest stats
    targetHero.applyItem(item); // Apply hero stats
    removeItem(this.items, item); // Dispose item
  }

  applyItem (item: Item) {
    this.light += item.info.offsetLight;
  }

  /**
   * Initializes quest behavior
   */
  initialize () {
    return [
      ...super.initialize(this.party),

      // Leaving a room
      intercept(
        this,
        'currentRoomId',
        (change) => {
          if (this.inBattle) {
            this.endBattle();
          }
          return change;
        }
      ),

      // Entering a new room attempts to battle monsters
      reaction(
        () => this.currentRoom,
        (room) => this.startBattle(room.monsters),
        true
      ),

      // Remove deceased heroes from the party
      autorun(() => {
        this.party
          .filter((m) => m.isDead)
          .forEach((m) => moveItem(m, this.party, this.deceased));
      })
    ];
  }

  whenVictorious (callback: () => void) {
    return when(() => !this.inBattle && this.isObjectiveMet, callback);
  }

  whenPartyWipes (callback: () => void) {
    return when(() => this.party.length === 0 && this.deceased.length > 0, callback);
  }
}

export enum QuestStatus {
  Idle = 'Idle',
  Started = 'Started',
  Defeat = 'Defeat',
  Escape = 'Escape',
  Victory = 'Victory'
}
