import {WhiteboardItemDto} from '../whiteboard-item-dto';

export class ItemGroupDto extends WhiteboardItemDto{
  private _wbItemGroup:Array<WhiteboardItemDto>;

  constructor(id, group, type, center, wbItemGroup: Array<WhiteboardItemDto>) {
    super(id, group, type, center);
    this._wbItemGroup = wbItemGroup;
  }

  get wbItemGroup(): Array<WhiteboardItemDto> {
    return this._wbItemGroup;
  }

  set wbItemGroup(value: Array<WhiteboardItemDto>) {
    this._wbItemGroup = value;
  }
}
