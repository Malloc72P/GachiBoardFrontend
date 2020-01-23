import {WhiteboardItem} from '../../whiteboard-item';

import * as paper from 'paper';
// @ts-ignore
import Rectangle = paper.Path.Rectangle;
// @ts-ignore
import Circle = paper.Path.Circle;
// @ts-ignore
import Point = paper.Point;
import {HandlerDirection} from './handler-direction.enum';
import {ItemAdjustor} from '../item-adjustor';

export abstract class ItemHandler {
  private _handlerCircleObject:Circle;

  private _handlerDirection;
  private _owner:WhiteboardItem;
  private _guideLine:Rectangle;

  protected constructor(wbItem, handlerDirection, handlerFillColor, handlerOption, guideLine){
    this.owner = wbItem;
    this.guideLine = guideLine;

    let zoomFactor = this.owner.posCalcService.getZoomState();

    this.handlerDirection = handlerDirection;
    this.handlerCircleObject = new Circle(
      new Point(
        this.guideLine.bounds.center.x,
        this.guideLine.bounds.center.y),
      handlerOption.circleRadius / zoomFactor
    );
    this.handlerCircleObject.style.fillColor = handlerFillColor;
    this.handlerCircleObject.position = this.getHandlerPosition(handlerDirection);
    // @ts-ignore
    this.handlerCircleObject.strokeColor = handlerOption.strokeColor;

    this.handlerCircleObject.data.struct = this;
  }
  protected getHandlerPosition(handlerDirection){
    let bounds = this.guideLine.bounds;
    switch (handlerDirection) {
      case HandlerDirection.TOP_LEFT :
        return bounds.topLeft;
      case HandlerDirection.TOP_CENTER :
        return bounds.topCenter;
      case HandlerDirection.TOP_RIGHT :
        return bounds.topRight;
      case HandlerDirection.CENTER_LEFT :
        return bounds.leftCenter;
      case HandlerDirection.CENTER_RIGHT :
        return bounds.rightCenter;
      case HandlerDirection.BOTTOM_LEFT :
        return bounds.bottomLeft;
      case HandlerDirection.BOTTOM_CENTER :
        return bounds.bottomCenter;
      case HandlerDirection.BOTTOM_RIGHT :
        return bounds.bottomRight;
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

  get guideLine(): paper.Path.Rectangle {
    return this._guideLine;
  }

  set guideLine(value: paper.Path.Rectangle) {
    this._guideLine = value;
  }
}
