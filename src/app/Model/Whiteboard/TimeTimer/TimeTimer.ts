import {KanbanItem} from '../ProjectSupporter/Kanban/KanbanItem/kanban-item';

export class TimeTimer {
  public kanbanItem:KanbanItem;
  public kanbanGroup;

  constructor(kanbanItem: KanbanItem, kanbanGroup) {
    this.kanbanItem = kanbanItem;
    this.kanbanGroup = kanbanGroup;
  }
}
