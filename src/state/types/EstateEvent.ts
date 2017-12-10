import {serializable} from 'serializr';
import {observable} from 'mobx';

export class EstateEvent {
  @serializable @observable message: string = '';
  @serializable @observable shown: boolean = false;
}
