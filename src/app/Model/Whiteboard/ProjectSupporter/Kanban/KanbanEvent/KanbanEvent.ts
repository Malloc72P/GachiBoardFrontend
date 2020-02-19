import {KanbanItemDto} from '../../../../../DTO/ProjectDto/KanbanDataDto/KanbanGroupDto/KanbanItemDto/kanban-item-dto';

export class KanbanEvent {
  public action:KanbanEventEnum;
  public kanbanItemDto:KanbanItemDto;
  public data;//초기 설계에서 예상치 못한 데이터를  담아야 하는 경우 사용

  constructor(action: KanbanEventEnum, kanbanItemDto: KanbanItemDto, data?) {
    this.action = action;
    this.kanbanItemDto = kanbanItemDto;
    this.data = data;
  }
}
export enum KanbanEventEnum {
  CREATE,
  CREATE_TAG,
  UPDATE,
  DELETE,
  DELETE_TAG,
  RELOCATE,
  LOCK,
  UNLOCK,
}
