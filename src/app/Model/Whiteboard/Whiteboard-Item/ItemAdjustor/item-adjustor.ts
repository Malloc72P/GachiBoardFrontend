import {LinkHandler} from './ItemHandler/LinkHandler/link-handler';
import {SizeHandler} from './ItemHandler/SizeHandler/size-handler';

import * as paper from 'paper';
// @ts-ignore
import Rectangle = paper.Path.Rectangle;

import {WhiteboardItem} from '../whiteboard-item';
import {HandlerDirection} from './ItemHandler/handler-direction.enum';
import {ZoomEvent, ZoomEventEnum} from '../../InfiniteCanvas/ZoomControl/zoom-control.service';

class HandlerOption {
  public static strokeWidth = 1;
  public static circleRadius = 6;
  public static strokeColor = "black";
  public static dashLength = 25;

}

export class ItemAdjustor {
  private _sizeHandlers:Map<any, SizeHandler>;
  private _linkHandlers:Map<any, LinkHandler>;
  private _itemGuideLine:Rectangle;
  private _guidelineDashLength;
  private _owner:WhiteboardItem;

  constructor(wbItem){
    this.owner = wbItem;

    this.initGuideLine();
    this.initHandlers();

    this.owner.zoomEventEmitter.subscribe((zoomEvent:ZoomEvent)=>{
      this.onZoomChange(zoomEvent);
    })
  }

  private initGuideLine(){
    let zoomFactor = this.owner.posCalcService.getZoomState();

    this.itemGuideLine = new Rectangle(this.owner.group.strokeBounds);
    this.itemGuideLine.strokeWidth = HandlerOption.strokeWidth / zoomFactor;
    this.itemGuideLine.strokeColor = new paper.Color('blue');
    this.itemGuideLine.dashArray = [HandlerOption.dashLength / zoomFactor,
      HandlerOption.dashLength / zoomFactor];
  }
  private initHandlers(){
    this.sizeHandlers = new Map<any, SizeHandler>();

    this.sizeHandlers.set(HandlerDirection.TOP_LEFT,
      new SizeHandler(this.owner, HandlerDirection.TOP_LEFT, HandlerOption));
    this.sizeHandlers.set(HandlerDirection.TOP_RIGHT,
      new SizeHandler(this.owner, HandlerDirection.TOP_RIGHT, HandlerOption));
    this.sizeHandlers.set(HandlerDirection.BOTTOM_LEFT,
      new SizeHandler(this.owner, HandlerDirection.BOTTOM_LEFT, HandlerOption));
    this.sizeHandlers.set(HandlerDirection.BOTTOM_RIGHT,
      new SizeHandler(this.owner, HandlerDirection.BOTTOM_RIGHT, HandlerOption));

    if(!this.owner.disableLinkHandler){
      this.linkHandlers = new Map<any, LinkHandler>();
      this.linkHandlers.set(HandlerDirection.TOP_CENTER,
        new LinkHandler(this.owner, HandlerDirection.TOP_CENTER, HandlerOption));
      this.linkHandlers.set(HandlerDirection.BOTTOM_CENTER,
        new LinkHandler(this.owner, HandlerDirection.BOTTOM_CENTER, HandlerOption));
      this.linkHandlers.set(HandlerDirection.CENTER_LEFT,
        new LinkHandler(this.owner, HandlerDirection.CENTER_LEFT, HandlerOption));
      this.linkHandlers.set(HandlerDirection.CENTER_RIGHT,
        new LinkHandler(this.owner, HandlerDirection.CENTER_RIGHT, HandlerOption));
    }
  }
  private onZoomChange(zoomEvent:ZoomEvent){
    switch (zoomEvent.zoomEvent) {
      case ZoomEventEnum.ZOOM_CHANGED:

        let zoomFactor = this.owner.posCalcService.getZoomState();
        this.itemGuideLine.strokeWidth = HandlerOption.strokeWidth / zoomFactor;

        this.itemGuideLine.dashArray = [HandlerOption.dashLength / zoomFactor,
          HandlerOption.dashLength / zoomFactor];

        this.sizeHandlers.forEach((value, key, map)=>{
          ItemAdjustor.reflectZoomFactorToHandler(value, zoomFactor);
        });
        if(!this.owner.disableLinkHandler){
          this.linkHandlers.forEach((value, key, map)=>{
            ItemAdjustor.reflectZoomFactorToHandler(value, zoomFactor);
          })
        }


        break;
      case ZoomEventEnum.ZOOM_IN:
        break;
      case ZoomEventEnum.ZOOM_OUT:
        break;
      default:
        break;
    }
  }

  private static reflectZoomFactorToHandler(value, zoomFactor){
    const diameter = HandlerOption.circleRadius / zoomFactor * 2;
    const center = value.handlerCircleObject.position;
    const topLeft = value.handlerCircleObject.bounds.topLeft;

    value.handlerCircleObject.strokeWidth = HandlerOption.strokeWidth / zoomFactor;
    value.handlerCircleObject.bounds = new paper.Rectangle(topLeft, new paper.Size(diameter, diameter));
    if(value instanceof LinkHandler){
      value.spreadHandler();
    }
    value.handlerCircleObject.position = center;
  }

  get sizeHandlers(): Map<any, SizeHandler> {
    return this._sizeHandlers;
  }

  set sizeHandlers(value: Map<any, SizeHandler>) {
    this._sizeHandlers = value;
  }

  get linkHandlers(): Map<any, LinkHandler> {
    return this._linkHandlers;
  }

  set linkHandlers(value: Map<any, LinkHandler>) {
    this._linkHandlers = value;
  }


  get itemGuideLine(): paper.Path.Rectangle {
    return this._itemGuideLine;
  }

  set itemGuideLine(value: paper.Path.Rectangle) {
    this._itemGuideLine = value;
  }

  get guidelineDashLength() {
    return this._guidelineDashLength;
  }

  set guidelineDashLength(value) {
    this._guidelineDashLength = value;
  }

  get owner(): WhiteboardItem {
    return this._owner;
  }

  set owner(value: WhiteboardItem) {
    this._owner = value;
  }
}
