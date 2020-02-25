import * as paper from 'paper';
// @ts-ignore
import Point = paper.Point;
// @ts-ignore
import Circle = paper.Path.Circle;

import {LinkPortDirectionEnum} from './LinkPortDirectionEnum/link-port-direction-enum.enum';
import {PositionCalcService} from '../../../PositionCalc/position-calc.service';
import {HandlerOption} from '../../ItemAdjustor/item-adjustor';
import {ZoomEvent} from '../../../InfiniteCanvas/ZoomControl/ZoomEvent/zoom-event';
import {ZoomEventEnum} from '../../../InfiniteCanvas/ZoomControl/ZoomEvent/zoom-event-enum.enum';
import {DrawingLayerManagerService} from '../../../InfiniteCanvas/DrawingLayerManager/drawing-layer-manager.service';
import {EventEmitter} from '@angular/core';
import {LinkEvent} from './LinkEvent/link-event';
import {LinkEventEnum} from './LinkEvent/link-event-enum.enum';
import {EditableLink} from './EditableLink/editable-link';
import {LinkPortDto} from '../../../../../DTO/WhiteboardItemDto/WhiteboardShapeDto/LinkPortDto/link-port-dto';
import {ItemLifeCycleEnum, ItemLifeCycleEvent} from "../../WhiteboardItemLifeCycle/WhiteboardItemLifeCycle";
import {LinkService} from "../../../Pointer/link-service/link.service";
import {Subscription} from "rxjs";

export class LinkPort {
  private _owner;
  private _direction;

  private _fromLinkList:Array<EditableLink>;
  private _toLinkList:Array<EditableLink>;

  private _posCalcService:PositionCalcService;
  private _layerService:DrawingLayerManagerService;
  private linkService: LinkService;

  private _handlerCircleObject:Circle;

  private tempLinkEntryCircle:Circle;
  private tempLinkExitCircle:Circle;

  private static readonly HANDLER_FILL_COLOR = 'skyblue';
  private static readonly HANDLER_MARGIN = 25;

  private _linkEventEmitter:EventEmitter<any>;

  private tempLink;

  private ownerLifeCycleSubscription: Subscription;
  private zoomChangeSubscription: Subscription;

  constructor(owner, direction){
    this.owner = owner;
    this.direction = direction;
    this.posCalcService = this.owner.layerService.posCalcService;
    this.layerService = this.owner.layerService;

    this.fromLinkList = new Array<EditableLink>();
    this.toLinkList = new Array<EditableLink>();
  }

  private createHandlerCircle() {
    if(!!this._handlerCircleObject) {
      this._handlerCircleObject.remove();
    }
    let handlerPosition = this.calcLinkPortPosition();
    let zoomFactor = this.posCalcService.getZoomState();

    this._handlerCircleObject = new Circle({
      center: handlerPosition.clone(),
      radius: HandlerOption.circleRadius / zoomFactor,
      strokeWidth: HandlerOption.strokeWidth / zoomFactor,
      fillColor: LinkPort.HANDLER_FILL_COLOR,
      strokeColor: HandlerOption.strokeColor,
    });
    this.handlerCircleObject.data.struct = this;
    this.spreadHandler();
  }

  public enable() {
    this.createHandlerCircle();
    this.ownerLifeCycleSubscription = this.owner.localLifeCycleEmitter.subscribe((event: ItemLifeCycleEvent) => {
      switch (event.action) {
        case ItemLifeCycleEnum.CREATE:
        case ItemLifeCycleEnum.MOVED:
        case ItemLifeCycleEnum.RESIZED:
          this.handlerCircleObject.position = this.calcLinkPortPosition();
          this.handlerCircleObject.bringToFront();
          this.spreadHandler();
          break;
      }
    });
    this.zoomChangeSubscription = this.owner.zoomEventEmitter.subscribe((zoomEvent: ZoomEvent) => {
      switch (zoomEvent.action) {
        case ZoomEventEnum.ZOOM_CHANGED:
          this.refreshForZoomChange(zoomEvent.zoomFactor);
          break;
        case ZoomEventEnum.ZOOM_IN:
          break;
        case ZoomEventEnum.ZOOM_OUT:
          break;
        default:
          break;
      }
    })
  }
  public disable(){
    if(!!this.ownerLifeCycleSubscription) {
      this.ownerLifeCycleSubscription.unsubscribe();
    }
    if(!!this.zoomChangeSubscription) {
      this.zoomChangeSubscription.unsubscribe();
    }
    if(!!this._handlerCircleObject) {
      this._handlerCircleObject.remove();
    }
  }

  public destroyLink(){
    for(let i = 0 ; i < this.fromLinkList.length; i++){
      this.fromLinkList[i].destroyItem();
    }

    this.handlerCircleObject.remove();

    if(this.tempLinkEntryCircle){
      this.tempLinkEntryCircle.remove();
    }
    if(this.tempLinkExitCircle){
      this.tempLinkExitCircle.remove();
    }
  }

  private refreshForZoomChange(zoomFactor: number){
    if(!this._handlerCircleObject) {
      return;
    }
    const diameter = HandlerOption.circleRadius / zoomFactor * 2;
    const center = this._handlerCircleObject.position;
    const topLeft = this._handlerCircleObject.bounds.topLeft;

    this._handlerCircleObject.strokeWidth = HandlerOption.strokeWidth / zoomFactor;
    this._handlerCircleObject.bounds = new paper.Rectangle(topLeft, new paper.Size(diameter, diameter));
    this._handlerCircleObject.position = center;

    this.spreadHandler();
  }


  public calcLinkPortPosition(): Point{
    let group = this.owner.group.bounds;
    switch (this.direction) {
      case LinkPortDirectionEnum.TOP:
        return group.topCenter;
      case LinkPortDirectionEnum.BOTTOM:
        return group.bottomCenter;
      case LinkPortDirectionEnum.LEFT:
        return group.leftCenter;
      case LinkPortDirectionEnum.RIGHT:
        return group.rightCenter;
      case LinkPortDirectionEnum.CENTER_TOP :
        return group.topCenter;
      case LinkPortDirectionEnum.BOTTOM_LEFT :
        return group.bottomLeft;
      case LinkPortDirectionEnum.BOTTOM_RIGHT :
        return group.bottomRight;
    }
  }

  public spreadHandler() {
    let zoomFactor = this.owner.layerService.posCalcService.getZoomState();
    let margin = LinkPort.HANDLER_MARGIN / zoomFactor;

    switch (this.direction) {
      case LinkPortDirectionEnum.TOP:
        this.handlerCircleObject.position = this.posCalcService.movePointTop(
          this.owner.coreItem.bounds.topCenter, margin
        );
        return;
      case LinkPortDirectionEnum.BOTTOM:
        this.handlerCircleObject.position = this.posCalcService.movePointBottom(
          this.owner.coreItem.bounds.bottomCenter, margin
        );
        return;
      case LinkPortDirectionEnum.LEFT:
        this.handlerCircleObject.position = this.posCalcService.movePointLeft(
          this.owner.coreItem.bounds.leftCenter, margin
        );
        return;
      case LinkPortDirectionEnum.RIGHT:
        this.handlerCircleObject.position = this.posCalcService.movePointRight(
          this.owner.coreItem.bounds.rightCenter, margin
        );
        return;
      case LinkPortDirectionEnum.CENTER_TOP:
        this.handlerCircleObject.position = this.posCalcService.movePointTop(
          this.owner.coreItem.bounds.topCenter, margin
        );
        return;
      case LinkPortDirectionEnum.BOTTOM_LEFT:
        this.handlerCircleObject.position = this.posCalcService.movePointBottom(
          this.posCalcService.movePointLeft(this.owner.coreItem.bounds.bottomLeft, margin), margin
        );
        return;
      case LinkPortDirectionEnum.BOTTOM_RIGHT:
        this.handlerCircleObject.position = this.posCalcService.movePointBottom(
          this.posCalcService.movePointRight(this.owner.coreItem.bounds.bottomRight, margin), margin
        );
        return;
    }
  }
  private animateEntryCircle(){
    let entrySegment = this.tempLink.tempLinkPath.firstSegment;

    this.tempLinkEntryCircle.onFrame = (event)=>{
      this.tempLinkEntryCircle.bounds.width += 0.5;
      this.tempLinkEntryCircle.bounds.height += 0.5;

      if(this.tempLinkEntryCircle.opacity - 0.005 > 0){
        this.tempLinkEntryCircle.opacity -= 0.005;
      }
      if(this.tempLinkEntryCircle.bounds.width > 30){
        this.tempLinkEntryCircle.bounds.width = 3;
        this.tempLinkEntryCircle.bounds.height = 3;
        this.tempLinkEntryCircle.opacity = 0.4;
      }
    };
  }
  private animateExitCircle(){
    let exitSegment = this.tempLink.tempLinkPath.lastSegment;

    this.tempLinkExitCircle.onFrame = (event)=>{
      this.tempLinkExitCircle.bounds.width += 1;
      this.tempLinkExitCircle.bounds.height += 1;

      if(this.tempLinkExitCircle.opacity - 0.005 > 0){
        this.tempLinkExitCircle.opacity -= 0.005;
      }
      if(this.tempLinkExitCircle.bounds.width > 60){
        this.tempLinkExitCircle.bounds.width = 3;
        this.tempLinkExitCircle.bounds.height = 3;
        this.tempLinkExitCircle.opacity = 0.4;
      }
    };
  }
  private onDeleteTempLink(){
    if(this.tempLinkEntryCircle){
      this.tempLinkEntryCircle.remove();
      this.tempLinkEntryCircle = null;
    }
    if(this.tempLinkExitCircle){
      this.tempLinkExitCircle.remove();
      this.tempLinkExitCircle = null;
    }
  }

  exportToDto(): LinkPortDto {
    return new LinkPortDto(
      this.direction,
      this.owner.id,
    );
  }

  get posCalcService(): PositionCalcService {
    return this._posCalcService;
  }

  set posCalcService(value: PositionCalcService) {
    this._posCalcService = value;
  }

  get owner() {
    return this._owner;
  }

  set owner(value) {
    this._owner = value;
  }

  get direction() {
    return this._direction;
  }

  set direction(value) {
    this._direction = value;
  }


  get fromLinkList(): Array<EditableLink> {
    return this._fromLinkList;
  }

  set fromLinkList(value: Array<EditableLink>) {
    this._fromLinkList = value;
  }

  get handlerCircleObject(): paper.Path.Circle {
    return this._handlerCircleObject;
  }

  set handlerCircleObject(value: paper.Path.Circle) {
    this._handlerCircleObject = value;
  }

  get layerService(): DrawingLayerManagerService {
    return this._layerService;
  }

  set layerService(value: DrawingLayerManagerService) {
    this._layerService = value;
  }

  get linkEventEmitter(): EventEmitter<any> {
    return this._linkEventEmitter;
  }

  set linkEventEmitter(value: EventEmitter<any>) {
    this._linkEventEmitter = value;
  }

  get toLinkList(): Array<EditableLink> {
    return this._toLinkList;
  }

  set toLinkList(value: Array<EditableLink>) {
    this._toLinkList = value;
  }
}
