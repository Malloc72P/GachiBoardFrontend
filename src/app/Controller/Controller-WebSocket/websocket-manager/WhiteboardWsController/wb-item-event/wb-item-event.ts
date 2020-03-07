import {WhiteboardItemDto} from '../../../../../DTO/WhiteboardItemDto/whiteboard-item-dto';

export class WbItemEvent {
  action:WbItemEventEnum;
  data;
  additionalData;

  constructor(action: WbItemEventEnum, data, additionalData?) {
    this.action = action;
    this.data = data;
    this.additionalData = additionalData;
  }
}
export enum WbItemEventEnum {
  CREATE,
  CREATE_MULTIPLE,
  DELETE,
  UPDATE,
  UPDATE_MULTIPLE,
  UPDATE_ZIndex,
  READ,
  LOCK,
  UNLOCK,
  OCCUPIED,
  NOT_OCCUPIED
}
