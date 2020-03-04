import {GachiPointDto} from './PointDto/gachi-point-dto';

export class WhiteboardItemDto {
  public id;
  public zIndex;
  public type;
  public center:GachiPointDto;

  public isGrouped;
  public parentEdtGroupId;

  constructor(id, type, center: GachiPointDto, isGrouped, parentEdtGroupId, zIndex?) {
    this.id = id;
    this.type = type;
    this.center = center;
    this.isGrouped = isGrouped;
    this.parentEdtGroupId = parentEdtGroupId;
    this.zIndex = zIndex;
  }
}
