import {Vector} from './Vector';
import {identifier, list, object, serializable} from 'serializr';
import uuid = require('uuid');
import {Character} from './Character';
import {generateCurio, generateMonster} from '../Generators';
import {observable} from 'mobx';
import {count} from '../../lib/Helpers';
import {Curio} from './Curio';
import {Dungeon} from './Dungeon';
import {Difficulty} from './Difficulty';

export type MapLocationId = string;

export class QuestRoom {
  @serializable(identifier()) id: MapLocationId = uuid();
  @serializable(object(Vector)) coordinates: Vector;
  @serializable roomImageIndex: number = 0;

  // Mutable
  @serializable(list(object(Character))) @observable monsters: Character[] = [];
  @serializable @observable isScouted: boolean = false;
  @serializable(list(object(Curio))) @observable curios: Curio[] = [];

  isConnectedTo (other: QuestRoom) {
    return this.coordinates.distance(other.coordinates) === 1;
  }

  static walk (
    dungeon: Dungeon,
    memory: Map<string, QuestRoom> = new Map<string, QuestRoom>(),
    difficulty: Difficulty,
    stepsLeft: number = 10,
    allowMonsters: (room: QuestRoom, coords: Vector) => boolean = () => true,
    coordinates: Vector = new Vector(),
    generatedMonsters: Character[] = []
  ) {
    const roomId = coordinates.id;
    let room = memory.get(roomId);

    if (!room) {
      room = new QuestRoom();
      room.coordinates = coordinates;
      room.roomImageIndex = Math.abs(Math.round(Math.random() * dungeon.info.roomImageUrls.length - 1));
      memory.set(roomId, room);
    }

    if (allowMonsters(room, coordinates)) {
      count(2).forEach(() => {
        const newMonster = generateMonster(dungeon, generatedMonsters);
        newMonster.classInfoStatsScale = difficultyStatsScales[difficulty];
        newMonster.resetMutableStats();
        generatedMonsters.push(newMonster);
        room.monsters.push(newMonster);
      });
    }

    count(Math.round(Math.random() * 3)).forEach(() => {
      room.curios.push(generateCurio());
    });

    if (stepsLeft <= 0) {
      return room;
    }

    const direction: Vector = Math.random() > 0.5 ?
      new Vector(Math.random() ? -1 : 1, 0) :
      new Vector(0, Math.random() ? -1 : 1);

    const nextCoordinate = coordinates.add(direction);

    QuestRoom.walk(dungeon, memory, difficulty, stepsLeft - 1, allowMonsters, nextCoordinate, generatedMonsters);

    return room;
  }
}

const difficultyStatsScales = {
  [Difficulty.Radiant]: 0.8,
  [Difficulty.Darkest]: 1,
  [Difficulty.Stygian]: 1.2
};
