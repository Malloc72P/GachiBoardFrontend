export enum KanbanGroupEnum {
  TODO          = "TODO",
  IN_PROGRESS   = "In Progress",
  DONE          = "DONE",
}
export class KanbanItemDto {
  public _id:number;
  public title:string;
  public userInfo;
  public color;
  public tagIdList:Array<any>;
  public parentGroup;
  public lockedBy = null;
  public isTimerStarted;
  public timerStartDate:Date;
  public timerEndDate:Date;

  constructor(id?: number, title?: string, userInfo?, color?, tagIdList?: Array<any>, parentGroup?) {
    this._id = id;
    this.title = title;
    this.userInfo = userInfo;
    this.color = color;
    this.tagIdList = tagIdList;
    this.parentGroup = parentGroup;
    this.tagIdList = new Array<any>();
  }
}
