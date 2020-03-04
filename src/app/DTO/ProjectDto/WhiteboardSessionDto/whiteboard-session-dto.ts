import {WhiteboardItemDto} from '../../WhiteboardItemDto/whiteboard-item-dto';
import {WbItemPacketDto} from '../../WhiteboardItemDto/WbItemPacketDto/WbItemPacketDto';

export class WhiteboardSessionDto {
  public _id;
  public title;
  public createdBy;
  public recentlyModifiedBy;
  public startDate:Date;
  public wbItemArray:Array<WbItemPacketDto>;
  public connectedUsers:Array<string>;

  public zIndexMinimum;
  public zIndexMaximum;

  constructor(id?, wbTitle?, createdBy?, recentlyModifiedBy?, startDate?: Date) {
    this._id = id;
    this.title = wbTitle;
    this.createdBy = createdBy;
    this.recentlyModifiedBy = recentlyModifiedBy;
    this.startDate = startDate;
    this.wbItemArray = new Array<WbItemPacketDto>();

    this.zIndexMinimum = 0;
    this.zIndexMaximum = 0;
  }
}
