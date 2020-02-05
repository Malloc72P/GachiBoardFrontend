import {ItemLifeCycleEnum} from '../../../../Whiteboard-Item/WhiteboardItemLifeCycle/WhiteboardItemLifeCycle';
import {WhiteboardItemDto} from '../../../../WhiteboardItemDto/whiteboard-item-dto';

export class WbItemWork {
  private _action:ItemLifeCycleEnum;
  private _wbItemDto:WhiteboardItemDto;

  constructor(action: ItemLifeCycleEnum, wbItemDto: WhiteboardItemDto) {
    this._action = action;
    this._wbItemDto = wbItemDto;
  }
  get action(): ItemLifeCycleEnum {
    return this._action;
  }

  set action(value: ItemLifeCycleEnum) {
    this._action = value;
  }

  get wbItemDto(): WhiteboardItemDto {
    return this._wbItemDto;
  }

  set wbItemDto(value: WhiteboardItemDto) {
    this._wbItemDto = value;
  }
}
