import {KanbanItem} from '../ProjectSupporter/Kanban/KanbanItem/kanban-item';

export class TimeTimer {
  public _id;
  public title;
  public timerStartDate:Date;
  public timerEndDate:Date;

  constructor(kanbanItem: KanbanItem) {
    this._id = kanbanItem._id;
    this.title = kanbanItem.title;
    this.timerStartDate = kanbanItem.timerStartDate;
    this.timerEndDate = kanbanItem.timerEndDate;
  }
}
