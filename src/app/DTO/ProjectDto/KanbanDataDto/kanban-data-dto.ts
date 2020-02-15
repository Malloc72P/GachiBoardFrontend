import {KanbanGroupDto} from './KanbanGroupDto/kanban-group-dto';
import {KanbanTagDto} from './KanbanTagDto/kanban-tag-dto';

export class KanbanDataDto {
  public todoGroup:Array<any>;
  public inProgressGroup:Array<any>;
  public doneGroup:Array<any>;

  public kanbanTagListDto:Array<any>;

  constructor(){
    this.todoGroup = new Array<any>();
    this.inProgressGroup = new Array<any>();
    this.doneGroup = new Array<any>();

    this.kanbanTagListDto = new Array<any>();
  }
}
