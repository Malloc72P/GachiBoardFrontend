import {ItemLifeCycleEnum} from '../../../../Whiteboard-Item/WhiteboardItemLifeCycle/WhiteboardItemLifeCycle';
import {WhiteboardItemDto} from '../../../../../../DTO/WhiteboardItemDto/whiteboard-item-dto';

export class WbItemWork {
  public action:ItemLifeCycleEnum;
  public wbItemDtoArray:Array<WhiteboardItemDto>;

  constructor(action: ItemLifeCycleEnum, wbItem?:WhiteboardItemDto) {
    this.action = action;
    this.wbItemDtoArray = new Array<WhiteboardItemDto>();

    if(wbItem){
      this.wbItemDtoArray.push(wbItem);
    }
  }

  clone() :WbItemWork{
    let cloneItem:WbItemWork = new WbItemWork(this.action);
    cloneItem.wbItemDtoArray = this.wbItemDtoArray;
    return cloneItem;
  }

}
