import {WhiteboardItemDto} from '../whiteboard-item-dto';
import {GachiPointDto} from '../PointDto/gachi-point-dto';

export class ItemGroupDto extends WhiteboardItemDto{
  private _wbItemIdGroup:Array<number>;


  constructor(id, type, center: GachiPointDto, isGrouped, parentEdtGroupId, wbItemIdGroup: Array<number>) {
    super(id, type, center, isGrouped, parentEdtGroupId);
    this._wbItemIdGroup = wbItemIdGroup;
  }

  get wbItemIdGroup(): Array<number> {
    return this._wbItemIdGroup;
  }

  set wbItemIdGroup(value: Array<number>) {
    this._wbItemIdGroup = value;
  }
}

