
export class KanbanItemDto {
  public id:number;
  public title:string;
  public userInfo;
  public color;
  public tagIdList:Array<any>;

  constructor(id?: number, title?: string, userInfo?, color?, tagIdList?: Array<any>) {
    this.id = id;
    this.title = title;
    this.userInfo = userInfo;
    this.color = color;
    this.tagIdList = tagIdList;
  }
}
