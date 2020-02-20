import {WhiteboardItem} from '../../../Whiteboard-Item/whiteboard-item';
import {WhiteboardItemDto} from '../../../../../DTO/WhiteboardItemDto/whiteboard-item-dto';

export class WbItemFactoryResult {
  private _newWbItem:WhiteboardItem;
  private _originDto:WhiteboardItemDto;

  constructor(newWbItem: WhiteboardItem, originDto: WhiteboardItemDto) {
    this._newWbItem = newWbItem;
    this._originDto = originDto;
  }

  get newWbItem(): WhiteboardItem {
    return this._newWbItem;
  }

  set newWbItem(value: WhiteboardItem) {
    this._newWbItem = value;
  }

  get originDto(): WhiteboardItemDto {
    return this._originDto;
  }

  set originDto(value: WhiteboardItemDto) {
    this._originDto = value;
  }
}
