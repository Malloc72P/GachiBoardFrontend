import {ItemGroupDto} from '../item-group-dto';
import {WhiteboardItemDto} from '../../whiteboard-item-dto';

export class EditableItemGroupDto extends ItemGroupDto{

  constructor(id, group, type, center, wbItemGroup: Array<WhiteboardItemDto>) {
    super(id, group, type, center, wbItemGroup);
  }
}
