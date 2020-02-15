import {KanbanItemDto} from '../../../../../DTO/ProjectDto/KanbanDataDto/KanbanGroupDto/KanbanItemDto/kanban-item-dto';

export class KanbanEvent {
  public action:KanbanEventEnum;
  public kanbanItemDto:KanbanItemDto;

  constructor(action: KanbanEventEnum, kanbanItemDto: KanbanItemDto) {
    this.action = action;
    this.kanbanItemDto = kanbanItemDto;
  }
}
export enum KanbanEventEnum {
  CREATE,
  UPDATE,
  DELETE
}
