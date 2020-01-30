import {LinkInfo} from './LinkInfo/link-info';
import {WhiteboardShape} from '../whiteboard-shape';
import {LinkPortDirectionEnum} from './LinkPortDirectionEnum/link-port-direction-enum.enum';

import * as paper from 'paper';
// @ts-ignore
import Path = paper.Path;
// @ts-ignore
import Point = paper.Point;
// @ts-ignore
import Item = paper.Item;
// @ts-ignore
import Segment = paper.Segment;
// @ts-ignore
import Color = paper.Color;
// @ts-ignore
import PointText = paper.PointText;
// @ts-ignore
import Group = paper.Group;
// @ts-ignore
import Rectangle = paper.Rectangle;
// @ts-ignore
import Circle = paper.Path.Circle;

import {PositionCalcService} from '../../../PositionCalc/position-calc.service';
import {HandlerDirection} from '../../ItemAdjustor/ItemHandler/handler-direction.enum';
import {HandlerOption} from '../../ItemAdjustor/item-adjustor';
import {ZoomEvent} from '../../../InfiniteCanvas/ZoomControl/ZoomEvent/zoom-event';
import {ZoomEventEnum} from '../../../InfiniteCanvas/ZoomControl/ZoomEvent/zoom-event-enum.enum';
import {WhiteboardItem} from '../../whiteboard-item';
import {DrawingLayerManagerService} from '../../../InfiniteCanvas/DrawingLayerManager/drawing-layer-manager.service';
import {EventEmitter} from '@angular/core';
import {LinkEvent} from './LinkEvent/link-event';
import {LinkEventEnum} from './LinkEvent/link-event-enum.enum';
import {EditableLink} from './EditableLink/editable-link';
import {LinkerModeEnum} from '../../../InfiniteCanvas/DrawingLayerManager/LinkModeManagerService/LinkMode/linker-mode-enum.enum';
import {SimpleLineLink} from './EditableLink/SimpleLineLink/simple-line-link';
import {SimpleArrowLink} from './EditableLink/SimpleArrowLink/simple-arrow-link';

export class LinkPort {
  private _owner:WhiteboardShape;
  private _direction;

  private _fromLinkList:Array<EditableLink>;
  private _toLinkList:Array<EditableLink>;

  private _posCalcService:PositionCalcService;
  private _layerService:DrawingLayerManagerService;

  private _handlerCircleObject:Circle;

  private tempLinkEntryCircle:Circle;
  private tempLinkExitCircle:Circle;

  private static readonly HANDLER_FILL_COLOR = 'skyblue';
  private static readonly HANDLER_MARGIN = 25;

  private _linkEventEmitter:EventEmitter<any>;

  private tempLink:EditableLink;

  constructor(owner, direction){
    this.owner = owner;
    this.direction = direction;
    this.posCalcService = this.owner.layerService.posCalcService;
    this.layerService = this.owner.layerService;

    this.initHandlerCircle();
    this.initZoomHandler();

    this.setLinkEventHandler();

    this.fromLinkList = new Array<EditableLink>();
    this.toLinkList = new Array<EditableLink>();

    this.setMouseCallback();
  }
  private setLinkEventHandler(){
    this.linkEventEmitter = new EventEmitter<any>();
    this.linkEventEmitter.subscribe((data:LinkEvent)=>{
      if(data.action === LinkEventEnum.LINK_DESTROYED){
        console.log("LinkPort >> linkEventEmitter >> data : ",data.invokerItem);
      }
    })
  }
  private refreshAllLink(){
    if(this.fromLinkList){
      this.fromLinkList.forEach((value, index, array)=>{
        value.refreshLink();
      })
    }
  }
  private initZoomHandler(){
    this.owner.zoomEventEmitter.subscribe((zoomEvent:ZoomEvent)=>{
      this.onZoomChange(zoomEvent);
    });

  }
  private initHandlerCircle(){
    let handlerPosition = this.calcLinkPortPosition();
    let handlerOption = HandlerOption;
    let zoomFactor = this.posCalcService.getZoomState();
    this.handlerCircleObject = new Circle(
      new Point(handlerPosition.x, handlerPosition.y),
      handlerOption.circleRadius / zoomFactor
    );
    // @ts-ignore
    this.handlerCircleObject.style.fillColor = LinkPort.HANDLER_FILL_COLOR;
    // @ts-ignore
    this.handlerCircleObject.strokeColor = handlerOption.strokeColor;

    this.handlerCircleObject.data.struct = this;

    this.spreadHandler();
    let prevPosition = this.owner.group.position;
    this.handlerCircleObject.onFrame = (event)=>{
      let currPosition = this.owner.group.position;
      if(prevPosition.x !== currPosition.x || prevPosition.y !== currPosition.y){
        this.handlerCircleObject.position = this.calcLinkPortPosition();
        this.spreadHandler();
      }
      if((event.count % 5) === 0){
        this.handlerCircleObject.bringToFront();
        if(this.owner.isSelected === true){
          if(this.owner.layerService.globalSelectedGroup.getNumberOfChild() === 1){
            this.enable();
          }
          else this.disable();
        }
        else this.disable();
      }
    };
  }

  private setMouseCallback(){
    this.handlerCircleObject.onMouseDown = (event)=>{
      let currentLinkerMode = this.layerService.currentLinkerMode;

      let strokeWidth = currentLinkerMode.strokeWidth;
      let strokeColor = currentLinkerMode.strokeColor;
      let fillColor   = currentLinkerMode.fillColor;

      switch (currentLinkerMode.mode) {
        case LinkerModeEnum.SIMPLE_lINE_lINK :
          this.tempLink = new SimpleLineLink(this, strokeColor,strokeWidth,fillColor);
          break;
        case LinkerModeEnum.SIMPLE_DASHED_lINE_lINK :
          this.tempLink = new SimpleLineLink(this, strokeColor,strokeWidth,fillColor,true);
          break;
        case LinkerModeEnum.SIMPLE_DASHED_ARROW_lINK :
          this.tempLink = new SimpleArrowLink(this, strokeColor,strokeWidth,fillColor,true);
          break;
        case LinkerModeEnum.SIMPLE_ARROW_LINK :
          this.tempLink = new SimpleArrowLink(this, strokeColor,strokeWidth,fillColor);
          break;
      }
      this.tempLink.initTempLink(event.point);
    };
    this.handlerCircleObject.onMouseDrag = (event)=>{
      this.tempLink.drawTempLink(event.point);
    };
    this.handlerCircleObject.onMouseUp = (event)=>{
      let point = event.point;

      let newLink = this.tempLink.linkToWbShape(point);
      if(newLink){
        this.fromLinkList.splice(this.fromLinkList.length, 0, newLink);
        let toLinkList = newLink.toLinkPort.toLinkList;
        toLinkList.splice(toLinkList.length, 0, newLink);
      }
      else{
        if (this.tempLink) {
          this.tempLink.destroyItem();
          delete this.tempLink;
        }
      }
    };
  }

  private enable(){
    this.handlerCircleObject.visible = true;
  }
  private disable(){
    this.handlerCircleObject.visible = false;
  }

  public destroyPortAndLink(){
    for(let i = 0 ; i < this.fromLinkList.length; i++){
      this.fromLinkList[i].destroyItem();
    }
    this.linkEventEmitter.emit(new LinkEvent(LinkEventEnum.WB_ITEM_DESTROYED, this.owner));

    this.handlerCircleObject.remove();

    if(this.tempLinkEntryCircle){
      this.tempLinkEntryCircle.remove();
    }
    if(this.tempLinkExitCircle){
      this.tempLinkExitCircle.remove();
    }
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
    LinkPort.reflectZoomFactorToHandler(this, zoomFactor);
  }

  private static reflectZoomFactorToHandler(value, zoomFactor){
    const diameter = HandlerOption.circleRadius / zoomFactor * 2;
    const center = value.handlerCircleObject.position;
    const topLeft = value.handlerCircleObject.bounds.topLeft;

    value.handlerCircleObject.strokeWidth = HandlerOption.strokeWidth / zoomFactor;
    value.handlerCircleObject.bounds = new paper.Rectangle(topLeft, new paper.Size(diameter, diameter));
    if(value instanceof LinkPort){
      value.spreadHandler();
    }
    value.handlerCircleObject.position = center;
  }


  public calcLinkPortPosition(){
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
    switch (this.direction) {
      case LinkPortDirectionEnum.TOP:
        this.handlerCircleObject.position = this.posCalcService.movePointTop(
          this.handlerCircleObject.position,
          LinkPort.HANDLER_MARGIN / zoomFactor
        );
        return;
      case LinkPortDirectionEnum.BOTTOM:
        this.handlerCircleObject.position = this.posCalcService.movePointBottom(
          this.handlerCircleObject.position,
          LinkPort.HANDLER_MARGIN / zoomFactor
        );
        return;
      case LinkPortDirectionEnum.LEFT:
        this.handlerCircleObject.position = this.posCalcService.movePointLeft(
          this.handlerCircleObject.position,
          LinkPort.HANDLER_MARGIN / zoomFactor
        );
        return;
      case LinkPortDirectionEnum.RIGHT:
        this.handlerCircleObject.position = this.posCalcService.movePointRight(
          this.handlerCircleObject.position,
          LinkPort.HANDLER_MARGIN / zoomFactor
        );
        return;
      case LinkPortDirectionEnum.CENTER_TOP:
        this.handlerCircleObject.position = this.posCalcService.movePointTop(
          this.handlerCircleObject.position,
          LinkPort.HANDLER_MARGIN / zoomFactor
        );
        return;
      case LinkPortDirectionEnum.BOTTOM_LEFT:
        this.handlerCircleObject.position = this.posCalcService.movePointLeft(
          this.handlerCircleObject.position,
          LinkPort.HANDLER_MARGIN/2 / zoomFactor
        );
        this.handlerCircleObject.position = this.posCalcService.movePointBottom(
          this.handlerCircleObject.position,
          LinkPort.HANDLER_MARGIN/2 / zoomFactor
        );
        return;
      case LinkPortDirectionEnum.BOTTOM_RIGHT:
        this.handlerCircleObject.position = this.posCalcService.movePointRight(
          this.handlerCircleObject.position,
          LinkPort.HANDLER_MARGIN/2 / zoomFactor
        );
        this.handlerCircleObject.position = this.posCalcService.movePointBottom(
          this.handlerCircleObject.position,
          LinkPort.HANDLER_MARGIN/2 / zoomFactor
        );
        return;
    }
  }

/*
  private onCreateTempLink(){
    let step = 0.1;
    this.tempLinkPath.onFrame = (event)=>{
      if(this.tempLinkPath.segments.length > 1){
        let entrySegment, exitSegment;
        entrySegment = this.tempLinkPath.firstSegment;
        exitSegment = this.tempLinkPath.lastSegment;

        if(!this.tempLinkEntryCircle && !this.tempLinkExitCircle){
          this.tempLinkEntryCircle = new Circle(new Point(entrySegment.point), 5);
          this.tempLinkExitCircle = new Circle(new Point(exitSegment.point), 5);

          // @ts-ignore
          this.tempLinkEntryCircle.style.strokeColor = "blue";
          // @ts-ignore
          this.tempLinkExitCircle.style.strokeColor = "blue";

          this.tempLinkEntryCircle.strokeWidth = 3;
          this.tempLinkExitCircle.strokeWidth = 3;

          this.tempLinkEntryCircle.opacity = 0.4;
          this.tempLinkExitCircle.opacity = 0.4;

          this.animateEntryCircle();
          this.animateExitCircle();
        }
        else{
          this.tempLinkEntryCircle.position = entrySegment.point;
          this.tempLinkExitCircle.position = exitSegment.point;
        }
      }
    };
  }
*/
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
      //this.tempLinkEntryCircle.position = entrySegment.point;
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
      //this.tempLinkExitCircle.position = exitSegment.point;
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
    this.tempLink.tempLinkPath.onFrame = ()=>{};
  }
/*
  public createLink(toWbShape, point){
    if(toWbShape){//링크 연결대상이 존재하여 링크 생성하는 경우
      let toLinkPort = toWbShape.linkPortMap.get(this.getCloseDirection(toWbShape, point));
      let newLink:Path = new Path({
        segments: [this.calcLinkPortPosition()],
        strokeColor: "black",
        strokeWidth: "1",
        strokeCap: 'round',
        strokeJoin: 'round',
      });
      newLink.add( toLinkPort.calcLinkPortPosition() );
      let newLinkInfo = new LinkInfo(this, toLinkPort, newLink);
      this.linkInfoList.push(newLinkInfo);
      this.layerService.globalSelectedGroup.extractAllFromSelection();
    }
  }
*/

  get posCalcService(): PositionCalcService {
    return this._posCalcService;
  }

  set posCalcService(value: PositionCalcService) {
    this._posCalcService = value;
  }

/*
  private adjustTempLinkPosition(){
    if(this.tempLinkPath.segments.length > 1){
      this.tempLinkPath.firstSegment.point = this.calcLinkPortPosition();
    }
  }
*/
/*
  private resetTempLink(){
    this.tempLinkPath.removeSegments();
    this.onDeleteTempLink();
  }
*/

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
