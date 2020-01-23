import {WhiteboardItem} from '../../whiteboard-item';

import * as paper from 'paper';
// @ts-ignore
import Rectangle = paper.Rectangle;
// @ts-ignore
import Circle = paper.Path.Circle;
// @ts-ignore
import Point = paper.Point;
import {HandlerDirection} from './handler-direction.enum';

export abstract class ItemHandler {
  private _handlerCircleObject:Circle;

  private _handlerDirection;
  private _owner:WhiteboardItem;

  protected constructor(wbItem, handlerDirection, handlerFillColor, handlerOption){
    this.owner = wbItem;

    let zoomFactor = this.owner.posCalcService.getZoomState();

    this.handlerDirection = handlerDirection;
    this.handlerCircleObject = new Circle(
      new Point(this.owner.group.bounds.center.x, this.owner.group.bounds.center.y),
      handlerOption.circleRadius / zoomFactor
    );
    this.handlerCircleObject.style.fillColor = handlerFillColor;
    this.handlerCircleObject.position = this.getHandlerPosition(handlerDirection);
    // @ts-ignore
    this.handlerCircleObject.strokeColor = handlerOption.strokeColor;

    this.handlerCircleObject.data.struct = this;
  }
  protected getHandlerPosition(handlerDirection){
    switch (handlerDirection) {
      case HandlerDirection.TOP_LEFT :
        return this.owner.group.bounds.topLeft;
      case HandlerDirection.TOP_CENTER :
        return this.owner.group.bounds.topCenter;
      case HandlerDirection.TOP_RIGHT :
        return this.owner.group.bounds.topRight;
      case HandlerDirection.CENTER_LEFT :
        return this.owner.group.bounds.leftCenter;
      case HandlerDirection.CENTER_RIGHT :
        return this.owner.group.bounds.rightCenter;
      case HandlerDirection.BOTTOM_LEFT :
        return this.owner.group.bounds.bottomLeft;
      case HandlerDirection.BOTTOM_CENTER :
        return this.owner.group.bounds.bottomCenter;
      case HandlerDirection.BOTTOM_RIGHT :
        return this.owner.group.bounds.bottomRight;
    }
  }

  public abstract removeItem();


  get handlerCircleObject(): Circle {
    return this._handlerCircleObject;
  }

  set handlerCircleObject(value: Circle) {
    this._handlerCircleObject = value;
  }

  get handlerDirection() {
    return this._handlerDirection;
  }

  set handlerDirection(value) {
    this._handlerDirection = value;
  }

  get owner(): WhiteboardItem {
    return this._owner;
  }

  set owner(value: WhiteboardItem) {
    this._owner = value;
  }
}
