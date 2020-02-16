import {SizeHandler} from './ItemHandler/SizeHandler/size-handler';

import * as paper from 'paper';
// @ts-ignore
import Rectangle = paper.Path.Rectangle;

import {WhiteboardItem} from '../whiteboard-item';
import {HandlerDirection} from './ItemHandler/handler-direction.enum';
import {ZoomEvent} from '../../InfiniteCanvas/ZoomControl/ZoomEvent/zoom-event';
import {ZoomEventEnum} from '../../InfiniteCanvas/ZoomControl/ZoomEvent/zoom-event-enum.enum';

export class HandlerOption {
  public static strokeWidth = 1;
  public static circleRadius = 10;
  public static strokeColor = "black";
  public static fillColor = "skyblue";
  public static dashLength = 25;
}

export class ItemAdjustor {
  private _sizeHandlers:Map<any, SizeHandler>;
  private _itemGuideLine:Rectangle;
  private _guidelineDashLength;
  private _owner:WhiteboardItem;

  constructor(wbItem){
    this.owner = wbItem;

    this.initGuideLine();
    this.initHandlers();

    this.owner.zoomEventEmitter.subscribe((zoomEvent: ZoomEvent)=>{
      this.onZoomChange(zoomEvent);
    });
  }
  public destroyItemAdjustor(){
    if(this.itemGuideLine){
      this.itemGuideLine.remove();
    }
    if (this.sizeHandlers) {
      this.sizeHandlers.forEach((value, key, map) => {
        value.removeItem();
      });
      this.sizeHandlers = null;
    }

  }
  public bringToFront(){
    this.itemGuideLine.bringToFront();
    if(this.sizeHandlers){
      this.sizeHandlers.forEach((value, key, map)=>{
        value.handlerCircleObject.bringToFront();
      });
    }
  }
  public disable(){
    this.itemGuideLine.visible = false;
    if (this.sizeHandlers) {
      this.sizeHandlers.forEach((value, key, map) => {
        value.disableItem();
      });
    }
  }
  public enable(){
    this.itemGuideLine.visible = true;
    if (this.sizeHandlers) {
      this.sizeHandlers.forEach((value, key, map) => {
        value.enableItem();
      });
    }
  }

  public enableSizeHandler() {
    if (this.sizeHandlers) {
      this.sizeHandlers.forEach((value, key, map) => {
        value.enableItem();
      });
    }
  }

  public disableSizeHandler() {
    if (this.sizeHandlers) {
      this.sizeHandlers.forEach((value, key, map) => {
        value.disableItem();
      });
    }
  }

  public refreshItemAdjustorSize(){
    this.itemGuideLine.bounds = this.owner.group.bounds;
    if(this.sizeHandlers){
      this.sizeHandlers.forEach((value, key, map)=>{
        value.refreshPosition();
      });
    }
  }

  // #### init 메서드
  private initGuideLine(){
    let zoomFactor = this.owner.layerService.posCalcService.getZoomState();

    this.itemGuideLine = new Rectangle(this.owner.group.strokeBounds);
    this.itemGuideLine.strokeWidth = HandlerOption.strokeWidth / zoomFactor;
    this.itemGuideLine.strokeColor = new paper.Color('blue');
    this.itemGuideLine.dashArray = [HandlerOption.dashLength / zoomFactor,
      HandlerOption.dashLength / zoomFactor];
  }
  private initHandlers(){
    this.sizeHandlers = new Map<any, SizeHandler>();

    this.sizeHandlers.set(HandlerDirection.TOP_LEFT,
      new SizeHandler(this.owner, HandlerDirection.TOP_LEFT, HandlerOption, this.itemGuideLine));
    this.sizeHandlers.set(HandlerDirection.TOP_RIGHT,
      new SizeHandler(this.owner, HandlerDirection.TOP_RIGHT, HandlerOption, this.itemGuideLine));
    this.sizeHandlers.set(HandlerDirection.BOTTOM_LEFT,
      new SizeHandler(this.owner, HandlerDirection.BOTTOM_LEFT, HandlerOption, this.itemGuideLine));
    this.sizeHandlers.set(HandlerDirection.BOTTOM_RIGHT,
      new SizeHandler(this.owner, HandlerDirection.BOTTOM_RIGHT, HandlerOption, this.itemGuideLine));
  }
  private onZoomChange(zoomEvent:ZoomEvent){
    switch (zoomEvent.action) {
      case ZoomEventEnum.ZOOM_CHANGED:
        this.refreshForZoomChange();
        break;
      case ZoomEventEnum.ZOOM_IN:
        break;
      case ZoomEventEnum.ZOOM_OUT:
        break;
      default:
        break;
    }
  }
  private refreshForZoomChange(){
    let zoomFactor = this.owner.layerService.posCalcService.getZoomState();
    this.itemGuideLine.strokeWidth = HandlerOption.strokeWidth / zoomFactor;

    this.itemGuideLine.dashArray = [HandlerOption.dashLength / zoomFactor,
      HandlerOption.dashLength / zoomFactor];
    if(this.sizeHandlers){
      this.sizeHandlers.forEach((value, key, map)=>{
        ItemAdjustor.reflectZoomFactorToHandler(value, zoomFactor);
      });
    }
  }
  private static reflectZoomFactorToHandler(value, zoomFactor){
    const diameter = HandlerOption.circleRadius / zoomFactor * 2;
    const center = value.handlerCircleObject.position;
    const topLeft = value.handlerCircleObject.bounds.topLeft;

    value.handlerCircleObject.strokeWidth = HandlerOption.strokeWidth / zoomFactor;
    value.handlerCircleObject.bounds = new paper.Rectangle(topLeft, new paper.Size(diameter, diameter));

    value.handlerCircleObject.position = center;
  }
  //#####################

  //########################## GETTER & SETTER ##################################

  get sizeHandlers(): Map<any, SizeHandler> {
    return this._sizeHandlers;
  }

  set sizeHandlers(value: Map<any, SizeHandler>) {
    this._sizeHandlers = value;
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
