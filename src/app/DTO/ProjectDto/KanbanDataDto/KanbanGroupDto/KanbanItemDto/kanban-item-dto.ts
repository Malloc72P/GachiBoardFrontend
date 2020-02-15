
export class KanbanItemDto {
  public id:number;
  public title:string;
  public userInfo;
  public color;
  public tagIdList:Array<any>;
  public parentGroup:string;

  constructor(id?: number, title?: string, userInfo?, color?, tagIdList?: Array<any>, parentGroup?:string) {
    this.id = id;
    this.title = title;
    this.userInfo = userInfo;
    this.color = color;
    this.tagIdList = tagIdList;
    this.parentGroup = parentGroup;
  }
}
