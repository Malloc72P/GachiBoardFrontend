import {GachiPointDto} from './PointDto/gachi-point-dto';

export class WhiteboardItemDto {
  public id;
  public type;
  public center:GachiPointDto;

  public isGrouped;
  public parentEdtGroupId;

  constructor(id, type, center: GachiPointDto, isGrouped, parentEdtGroupId) {
    this.id = id;
    this.type = type;
    this.center = center;
    this.isGrouped = isGrouped;
    this.parentEdtGroupId = parentEdtGroupId;
  }
}
