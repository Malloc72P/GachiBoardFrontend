import {WhiteboardItemDto} from '../whiteboard-item-dto';
import {GachiPointDto} from '../PointDto/gachi-point-dto';

export class ItemGroupDto extends WhiteboardItemDto{
  public wbItemIdGroup: Array<number>;

  constructor(id, type, center: GachiPointDto, isGrouped, parentEdtGroupId, wbItemIdGroup: Array<number>) {
    super(id, type, center, isGrouped, parentEdtGroupId);
    this.wbItemIdGroup = wbItemIdGroup;
  }
}

