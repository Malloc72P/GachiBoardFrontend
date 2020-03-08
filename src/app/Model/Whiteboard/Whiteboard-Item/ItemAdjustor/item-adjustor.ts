import * as paper from 'paper';
// @ts-ignore
import Path = paper.Path;
// @ts-ignore
import Rectangle = paper.Rectangle;

import {SizeHandler} from './ItemHandler/SizeHandler/size-handler';
import {WhiteboardItem} from '../whiteboard-item';
import {HandlerDirection} from './ItemHandler/handler-direction.enum';
import {ZoomEvent} from '../../InfiniteCanvas/ZoomControl/ZoomEvent/zoom-event';
import {ZoomEventEnum} from '../../InfiniteCanvas/ZoomControl/ZoomEvent/zoom-event-enum.enum';
import {ItemLifeCycleEnum, ItemLifeCycleEvent} from "../WhiteboardItemLifeCycle/WhiteboardItemLifeCycle";

export class HandlerOption {
  public static strokeWidth = 1;
  public static circleRadius = 10;
  public static strokeColor = "black";
  public static fillColor = "skyblue";
  public static dashLength = 25;
}

export class ItemAdjustor {
  private _sizeHandlers:Map<any, SizeHandler>;
  private _itemGuideLine: Path.Rectangle;
  private background: Path.Rectangle;
  private _guidelineDashLength: number;
  private _owner:WhiteboardItem;

  constructor(wbItem){
    this.owner = wbItem;

    this.initBackground();
    this.initGuideLine();
    this.initHandlers();

    this.owner.zoomEventEmitter.subscribe((zoomEvent: ZoomEvent)=>{
      this.onZoomChange(zoomEvent);
    });
    this.subscribeLifeCycleEvent();
  }

  private subscribeLifeCycleEvent() {
    this.owner.layerService.globalSelectedGroup.localLifeCycleEmitter.subscribe((event: ItemLifeCycleEvent) => {
      switch (event.action) {
        case ItemLifeCycleEnum.MOVED:
        case ItemLifeCycleEnum.RESIZED:
        case ItemLifeCycleEnum.SELECT_CHANGED:
          this.reboundToItem(event.item);
          if(!!this.sizeHandlers) {
            this.sizeHandlers.forEach(value => {
              value.refreshPosition();
            });
          }
          this.bringToFront();
          break;

      }
    });
  }

  private reboundToItem(wbItem: WhiteboardItem) {
    this.itemGuideLine.bounds = wbItem.coreItem.bounds;
    this.background.bounds = wbItem.coreItem.bounds;
  }

  public destroyItemAdjustor(){
    if(this.itemGuideLine){
      this.itemGuideLine.remove();
    }
    if(!!this.background) {
      this.background.remove();
    }
    if (this.sizeHandlers) {
      this.sizeHandlers.forEach((value, key, map) => {
        value.removeItem();
      });
      this.sizeHandlers = null;
    }

  }
  public bringToFront(){
    this.background.bringToFront();
    this.itemGuideLine.bringToFront();
    if(this.sizeHandlers){
      this.sizeHandlers.forEach((value, key, map)=>{
        value.handlerCircleObject.bringToFront();
      });
    }
  }

  public enable() {
    if (!!this.sizeHandlers) {
      this.sizeHandlers.forEach((value, key, map) => {
        value.enableItem();
      });
    }
    if(!!this.background) {
      this.background.visible = true;
    }
  }

  public disable() {
    if (!!this.sizeHandlers) {
      this.sizeHandlers.forEach((value, key, map) => {
        value.disableItem();
      });
    }
    if(!!this.background) {
      this.background.visible = false;
    }
  }

  // #### init 메서드
  private initGuideLine(){
    let zoomFactor = this.owner.layerService.posCalcService.getZoomState();

    this.itemGuideLine = new Path.Rectangle(this.owner.group.strokeBounds);
    this.itemGuideLine.strokeWidth = HandlerOption.strokeWidth / zoomFactor;
    this.itemGuideLine.strokeColor = new paper.Color('blue');
    this.itemGuideLine.dashArray = [HandlerOption.dashLength / zoomFactor,
      HandlerOption.dashLength / zoomFactor];
    this.itemGuideLine.name = "GuideLine";
  }

  private initBackground() {
    this.background = new Path.Rectangle(this.owner.group.strokeBounds);
    this.background.fillColor = new paper.Color('skyblue');
    this.background.opacity = 0.2;
    this.background.name = "BG";
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

  get bound(): Path.Rectangle {
    return this.background;
  }
}
