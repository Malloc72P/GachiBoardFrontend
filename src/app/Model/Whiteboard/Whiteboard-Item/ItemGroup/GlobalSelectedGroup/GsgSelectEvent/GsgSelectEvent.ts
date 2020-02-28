import {WhiteboardItem} from '../../../whiteboard-item';

export class GsgSelectEvent {
  public action:GsgSelectEventEnum;
  public wbItem:WhiteboardItem;
  public additionalData:any;

  constructor(action:GsgSelectEventEnum, wbItem: WhiteboardItem, additionalData?) {
    this.action = action;
    this.wbItem = wbItem;
    this.additionalData = additionalData;
  }
}

export enum GsgSelectEventEnum {
  SELECTED,
  DESELECTED
}
