import {WhiteboardItemDto} from '../whiteboard-item-dto';


export class WbItemPacketDto {
  public _id;
  public createdBy;
  public lastModifier;
  public version:number;
  public touchHistory:Array<any>;
  public wbItemDto:WhiteboardItemDto;
  public createdDate:Date;
  public modifiedDate:Date;

  constructor(createdBy?, wbItemDto?: WhiteboardItemDto) {
    this.createdBy = createdBy;
    this.lastModifier = createdBy;
    this.version = 0;
    this.touchHistory = new Array<any>();
    this.wbItemDto = wbItemDto;
    this.createdDate = new Date();
    this.modifiedDate = new Date();
  }
}
