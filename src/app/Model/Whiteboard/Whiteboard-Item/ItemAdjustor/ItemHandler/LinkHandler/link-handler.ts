import {ItemHandler} from '../item-handler';
import {HandlerDirection} from '../handler-direction.enum';

export class LinkHandler extends ItemHandler{
  private static readonly HANDLER_FILL_COLOR = "skyblue";
  private static readonly HANDLER_MARGIN = 25;
  constructor(wbItem, handlerDirection, handlerOption){
    super(wbItem, handlerDirection, LinkHandler.HANDLER_FILL_COLOR, handlerOption);
    this.spreadHandler();
  }

  public spreadHandler(){
    let zoomFactor = this.owner.posCalcService.getZoomState();
    switch (this.handlerDirection) {
      case HandlerDirection.TOP_CENTER:
        this.handlerCircleObject.position = this.owner.posCalcService.movePointTop(
            this.handlerCircleObject.position,
            LinkHandler.HANDLER_MARGIN / zoomFactor
        );
        return;
      case HandlerDirection.BOTTOM_CENTER:
        this.handlerCircleObject.position = this.owner.posCalcService.movePointBottom(
            this.handlerCircleObject.position,
            LinkHandler.HANDLER_MARGIN / zoomFactor
        );
        return;
      case HandlerDirection.CENTER_LEFT:
        this.handlerCircleObject.position = this.owner.posCalcService.movePointLeft(
            this.handlerCircleObject.position,
            LinkHandler.HANDLER_MARGIN / zoomFactor
        );
        return;
      case HandlerDirection.CENTER_RIGHT:
        this.handlerCircleObject.position = this.owner.posCalcService.movePointRight(
            this.handlerCircleObject.position,
            LinkHandler.HANDLER_MARGIN / zoomFactor
        );
        return;
    }
  }
  public removeItem() {
    this.handlerCircleObject.remove();
  }



}
