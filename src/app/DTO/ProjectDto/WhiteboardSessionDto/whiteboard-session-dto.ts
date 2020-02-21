import {WhiteboardItemDto} from '../../WhiteboardItemDto/whiteboard-item-dto';

export class WhiteboardSessionDto {
  public _id;
  public title;
  public createdBy;
  public recentlyModifiedBy;
  public startDate:Date;
  public wbItemArray:Array<WhiteboardItemDto>;
  public connectedUsers:Array<string>;

  constructor(id?, wbTitle?, createdBy?, recentlyModifiedBy?, startDate?: Date) {
    this._id = id;
    this.title = wbTitle;
    this.createdBy = createdBy;
    this.recentlyModifiedBy = recentlyModifiedBy;
    this.startDate = startDate;
    this.wbItemArray = new Array<WhiteboardItemDto>();
  }
}
