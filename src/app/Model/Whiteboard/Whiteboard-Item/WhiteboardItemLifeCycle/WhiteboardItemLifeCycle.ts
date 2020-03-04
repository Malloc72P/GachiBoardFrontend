import {WhiteboardItem} from '../whiteboard-item';
import {EditableLink} from '../Whiteboard-Shape/LinkPort/EditableLink/editable-link';

export class ItemLifeCycleEvent {
  id;
  item:WhiteboardItem;
  action:ItemLifeCycleEnum;
  constructor(id, item, action){
    this.id = id;
    this.item = item;
    this.action = action;
  }
}

export class LinkItemLifeCycleEvent {
  id;
  item:EditableLink;
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
  DESTROY,
  MOVED,
  RESIZED,
  SELECTED,
  DESELECTED,
  SELECT_CHANGED,
  LINK_CHANGED,
  LOCKED,
  UNLOCKED,
  COPIED,
}
