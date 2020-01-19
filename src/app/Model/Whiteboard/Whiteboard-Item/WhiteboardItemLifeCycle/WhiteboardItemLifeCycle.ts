import {WhiteboardItem} from '../whiteboard-item';

export class ItemLifeCycleEvent {
  id;
  item:WhiteboardItem;
  action;
  constructor(id, item, action){
    this.id = id;
    this.item = item;
    this.action = action;
  }
}
export enum ItemLifeCycleEnum {
  CREATE,
  MODIFY,
  DESTROY
}
