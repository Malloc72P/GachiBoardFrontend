import {WhiteboardItemDto} from '../../../../../DTO/WhiteboardItemDto/whiteboard-item-dto';

export class WbItemEvent {
  action:WbItemEventEnum;
  data:WhiteboardItemDto;
  additionalData;

  constructor(action: WbItemEventEnum, data: WhiteboardItemDto, additionalData?) {
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
  READ,
  LOCK,
  UNLOCK,
  OCCUPIED,
  NOT_OCCUPIED
}
