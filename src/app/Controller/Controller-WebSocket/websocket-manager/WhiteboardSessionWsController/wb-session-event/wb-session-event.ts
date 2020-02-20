import {WhiteboardSessionDto} from '../../../../../DTO/ProjectDto/WhiteboardSessionDto/whiteboard-session-dto';

export class WbSessionEvent {
  action:WbSessionEventEnum;
  data:WhiteboardSessionDto;
  additionalData;

  constructor(action: WbSessionEventEnum, data: WhiteboardSessionDto, additionalData?) {
    this.action = action;
    this.data = data;
    this.additionalData = additionalData;
  }
}
export enum WbSessionEventEnum {
  CREATE,
  DELETE,
  UPDATE,
  READ
}
