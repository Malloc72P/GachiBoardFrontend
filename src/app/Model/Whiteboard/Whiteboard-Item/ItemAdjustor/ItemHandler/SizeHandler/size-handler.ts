import {ItemHandler} from '../item-handler';

import * as paper from 'paper';
import {PointCalculator} from '../../../../Pointer/point-calculator/point-calculator';
// @ts-ignore
import Point = paper.Point;

export class SizeHandler extends ItemHandler{
  private static readonly HANDLER_FILL_COLOR = "white";
  constructor(wbItem, handlerDirection, handlerOption, guideLine){
    super(wbItem, handlerDirection, SizeHandler.HANDLER_FILL_COLOR, handlerOption, guideLine);
  }

  public removeItem() {
    this.handlerCircleObject.remove();
  }

  private ratio = { width: 0, height: 0 };
  private adjustSizeFrom:Point;
  private adjustSizeTo:Point;



  public onMouseDown(event) {
    this.initSizingDataBeforeResizing();
    this.owner.layerService.horizonContextMenuService.close();
  }

  public onMouseDrag(event) {
    let resizePoint = event.point;
    let minSize = 5;
    let selectedGroup = this.owner.layerService.globalSelectedGroup;

    let width = this.adjustSizeFrom.x - resizePoint.x;
    if(width < minSize && width >= 0) {
      resizePoint.x = this.adjustSizeFrom.x - minSize;
    } else if (width > -minSize && width < 0) {
      resizePoint.x = this.adjustSizeFrom.x + minSize;
    }


    const height = this.adjustSizeFrom.y - resizePoint.y;
    if(height < minSize && height >= 0) {
      resizePoint.y = this.adjustSizeFrom.y - minSize;
    } else if (height > -minSize && height < 0) {
      resizePoint.y = this.adjustSizeFrom.y + minSize;
    }
    if(event.modifiers.control === true) {
      PointCalculator.forSquare(this.adjustSizeFrom, resizePoint);
    } else if(event.modifiers.shift) {
      PointCalculator.forFixRatio(this.adjustSizeFrom, resizePoint, this.ratio);
    }

    selectedGroup.resizeTo(new paper.Rectangle(this.adjustSizeFrom, event.point));

    this.owner.myItemAdjustor.refreshItemAdjustorSize();
  }

  public onMouseUp(event) {
    this.owner.refreshItem();
    // TODO : HorizonContextMenuService Test Code
    this.owner.layerService.horizonContextMenuService.open();
  }

  private initSizingDataBeforeResizing() {
    let selectedGroup = this.owner.layerService.globalSelectedGroup.group;
    this.ratio.width = selectedGroup.bounds.width;
    this.ratio.height = selectedGroup.bounds.height;

    this.adjustSizeTo = this.getHandlerPosition(this.handlerDirection);
    this.adjustSizeFrom = this.getOppositeHandlerPosition(this.handlerDirection);
  }

  public onMouseEnter() {
    this.owner.layerService.cursorChanger.changeResize(this.handlerDirection);
  }

  public onMouseLeave() {
    this.owner.layerService.cursorChanger.syncCurrentPointerMode(this.owner.layerService.currentPointerMode);
  }

}
