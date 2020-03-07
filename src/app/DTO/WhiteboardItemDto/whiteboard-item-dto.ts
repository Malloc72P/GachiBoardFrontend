import {GachiPointDto} from './PointDto/gachi-point-dto';

export class WhiteboardItemDto {
  public id;
  public zIndex;
  public type;
  public center:GachiPointDto;

  public isGrouped;
  public parentEdtGroupId;

  public groupedIdList:Array<any>;

  constructor(id, type, center: GachiPointDto, isGrouped, parentEdtGroupId, zIndex?) {
    this.id = id;
    this.type = type;
    this.center = center;
    this.isGrouped = isGrouped;
    this.parentEdtGroupId = parentEdtGroupId;
    this.zIndex = zIndex;
    this.groupedIdList = new Array<any>();
  }
}
