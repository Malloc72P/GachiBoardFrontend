import {ItemGroupDto} from '../item-group-dto';
import {WhiteboardItemDto} from '../../whiteboard-item-dto';
import {GachiPointDto} from '../../PointDto/gachi-point-dto';

export class EditableItemGroupDto extends ItemGroupDto{

  constructor(id, type, center: GachiPointDto, isGrouped, parentEdtGroupId, wbItemIdGroup: Array<number>, isLocked) {
    super(id, type, center, isGrouped, parentEdtGroupId, wbItemIdGroup, isLocked);
  }
}
