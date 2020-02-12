import {KanbanItemDto} from './KanbanItemDto/kanban-item-dto';

export class KanbanGroupDto {
  public title:string;
  public groupColor:string;
  public kanbanItemList:Array<KanbanItemDto>;

  constructor(title?, groupColor?){
    this.title = title;
    this.kanbanItemList = new Array<KanbanItemDto>();
    this.groupColor = groupColor;
  }
}
