// ##### TagListControl
import {KanbanItem} from '../KanbanItem/kanban-item';

export class KanbanGroup {
  title:string;
  groupColor:string;
  kanbanItemList:Array<KanbanItem>;
  isFocused:Boolean;
  constructor(title, groupColor){
    this.title = title;
    this.kanbanItemList = new Array<KanbanItem>();
    this.groupColor = groupColor;
    this.isFocused = false;
  }
}
