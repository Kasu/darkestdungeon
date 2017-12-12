import {identifier, list, object, serializable} from 'serializr';
import {v4 as uuid} from 'uuid';
import {Item} from './Item';
import {TurnStats} from './Stats';
import {observable} from 'mobx';

export type CurioId = string;

export class Curio {
  @serializable(identifier()) id: CurioId = uuid();
  @serializable name: string = '';
  @serializable(object(TurnStats)) buff: TurnStats = null;
  @serializable(list(object(Item))) @observable items: Item[] = [];
  @serializable @observable hasBeenInteractedWith: boolean = false;
  @serializable replaceQuirk: boolean;
}
