import {WhiteboardSessionDto} from '../../../../../DTO/ProjectDto/WhiteboardSessionDto/whiteboard-session-dto';

export class WbSessionEvent {
  action:WbSessionEventEnum;
  data;
  additionalData;

  constructor(action: WbSessionEventEnum, data, additionalData?:WbSessionEventEnum) {
    this.action = action;
    this.data = data;
    this.additionalData = additionalData;
  }
}
export enum WbSessionEventEnum {
  CREATE,
  DELETE,
  UPDATE,
  READ,
  JOIN,
  DISCONNECT,
  UPDATE_CURSOR
}
