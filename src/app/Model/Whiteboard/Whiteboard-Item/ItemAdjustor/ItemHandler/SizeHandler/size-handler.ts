import {ItemHandler} from '../item-handler';

export class SizeHandler extends ItemHandler{
  private static readonly HANDLER_FILL_COLOR = "white";
  constructor(wbItem, handlerDirection, handlerOption){
    super(wbItem, handlerDirection, SizeHandler.HANDLER_FILL_COLOR, handlerOption);
  }

  public removeItem() {
    this.handlerCircleObject.remove();
  }
}
