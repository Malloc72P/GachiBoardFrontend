import {GachiPointDto} from '../../PointDto/gachi-point-dto';
import {WhiteboardItemType} from '../../../../Model/Helper/data-type-enum/data-type.enum';

export class GlobalSelectedGroupDto {
  public width;
  public height;

  public type;

  public topLeft:GachiPointDto;
  public wbItemGroup:Array<any>;

  public userIdToken;
  public userName;

  constructor(width, height, topLeft: GachiPointDto, wbItemGroup: Array<any>) {
    this.width = width;
    this.height = height;
    this.topLeft = topLeft;
    this.wbItemGroup = wbItemGroup;

    this.type = WhiteboardItemType.GLOBAL_SELECTED_GROUP;
  }
}
