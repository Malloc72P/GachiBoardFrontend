import {KanbanGroupDto} from './KanbanGroupDto/kanban-group-dto';
import {KanbanTagDto} from './KanbanTagDto/kanban-tag-dto';

export class KanbanDataDto {
  public todoGroup:KanbanGroupDto;
  public inProgressGroup:KanbanGroupDto;
  public doneGroup:KanbanGroupDto;

  public kanbanTagListDto:Array<KanbanTagDto>;

  constructor(){
    this.todoGroup = new KanbanGroupDto();
    this.inProgressGroup = new KanbanGroupDto();
    this.doneGroup = new KanbanGroupDto();

    this.kanbanTagListDto = new Array<KanbanTagDto>();
  }
}
