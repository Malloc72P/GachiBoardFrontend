import {ItemHandler} from '../item-handler';

export class SizeHandler extends ItemHandler{
  private static readonly HANDLER_FILL_COLOR = "white";
  constructor(wbItem, handlerDirection, handlerOption, guideLine){
    super(wbItem, handlerDirection, SizeHandler.HANDLER_FILL_COLOR, handlerOption, guideLine);
  }

  public removeItem() {
    this.handlerCircleObject.remove();
  }
}
