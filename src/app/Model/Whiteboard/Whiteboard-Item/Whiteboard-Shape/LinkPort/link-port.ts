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

export class LinkPort {
  private _owner:WhiteboardShape;
  private _direction;
  private _linkInfoList:Array<LinkInfo>;
  private _posCalcService:PositionCalcService;
  private _layerService:DrawingLayerManagerService;

  private _handlerCircleObject:Circle;

  private tempLinkPath:Path;

  private tempLinkEntryCircle:Circle;
  private tempLinkExitCircle:Circle;

  private static readonly HANDLER_FILL_COLOR = 'skyblue';
  private static readonly HANDLER_MARGIN = 25;

  constructor(owner, direction, posCalcService){
    this.owner = owner;
    this.direction = direction;
    this.posCalcService = posCalcService;
    this.layerService = this.owner.layerService;
    this.tempLinkPath = new Path({
      segments: [this.calcLinkPortPosition()],
      strokeColor: "black",
      strokeWidth: "1",
      strokeCap: 'round',
      strokeJoin: 'round',
    });

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

    this.tempLinkPath.onFrame = (event)=>{
      this.adjustTempLinkPosition();
    };

    this.owner.zoomEventEmitter.subscribe((zoomEvent:ZoomEvent)=>{
      this.onZoomChange(zoomEvent);
    });

    this.linkInfoList = new Array<LinkInfo>();

    this.handlerCircleObject.onMouseDown = (event)=>{

    };
    this.handlerCircleObject.onMouseDrag = (event)=>{
      let point = event.point;
      let hitWbShape:WhiteboardShape = this._layerService.getHittedItem(point) as WhiteboardShape;

      if(hitWbShape && hitWbShape.id !== this.owner.id && hitWbShape.linkPortMap){
        this.tempLinkToWbItem(hitWbShape, point);
      }else{
        this.tempLinkToEmptyField(point);
      }
    };
    this.handlerCircleObject.onMouseUp = (event)=>{
      let point = event.point;
      let toWbShape:WhiteboardShape = this.layerService.getHittedItem(point) as WhiteboardShape;

      if(toWbShape && toWbShape.id !== this.owner.id && toWbShape.linkPortMap){
        this.createLink(toWbShape, point);
      }
      this.resetTempLink();
    };

  }
  private enable(){
    this.handlerCircleObject.visible = true;
  }
  private disable(){
    this.handlerCircleObject.visible = false;
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
    }
  }


  public tempLinkToEmptyField(point){
    this.tempLinkPath.removeSegments();
    this.tempLinkPath.add( this.calcLinkPortPosition() );
    this.tempLinkPath.add(point);
    this.onCreateTempLink();
  }
  public tempLinkToWbItem(toWbShape:WhiteboardShape, point){
    this.tempLinkPath.removeSegments();
    this.tempLinkPath.add( this.calcLinkPortPosition() );

    let toLinkPort = toWbShape.linkPortMap.get(this.getCloseDirection(toWbShape, point));
    if(toWbShape.linkPortMap){
      toLinkPort = toWbShape.linkPortMap.get(this.getCloseDirection(toWbShape, point));
    } else return;

    this.tempLinkPath.add(toLinkPort.calcLinkPortPosition());
    this.onCreateTempLink();
  }
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
  private animateEntryCircle(){
    let entrySegment = this.tempLinkPath.firstSegment;

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
    let exitSegment = this.tempLinkPath.lastSegment;

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
    this.tempLinkPath.onFrame = ()=>{};
  }
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


  private getCloseDirection(wbShape:WhiteboardShape, point:Point){
    let closestDirection = 0;
    let closestDistance = this.posCalcService.calcPointDistanceOn2D(point, wbShape.group.bounds.topCenter);
    for(let i = 1 ; i < 4; i++){
      let newDistance = this.posCalcService.calcPointDistanceOn2D(point, wbShape.getDirectionPoint(i));
      if(newDistance < closestDistance){
        closestDirection = i;
        closestDistance = newDistance;
      }
    }
    return closestDirection;
  }
  public onOwnerChanged(){
    this.adjustTempLinkPosition();
  }

  get posCalcService(): PositionCalcService {
    return this._posCalcService;
  }

  set posCalcService(value: PositionCalcService) {
    this._posCalcService = value;
  }

  private adjustTempLinkPosition(){
    if(this.tempLinkPath.segments.length > 1){
      this.tempLinkPath.firstSegment.point = this.calcLinkPortPosition();
    }
  }
  private resetTempLink(){
    this.tempLinkPath.removeSegments();
    this.onDeleteTempLink();
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

  get linkInfoList(): Array<LinkInfo> {
    return this._linkInfoList;
  }

  set linkInfoList(value: Array<LinkInfo>) {
    this._linkInfoList = value;
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
}
