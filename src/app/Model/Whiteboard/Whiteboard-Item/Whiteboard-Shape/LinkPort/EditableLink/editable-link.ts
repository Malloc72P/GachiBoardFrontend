
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

import {WhiteboardShape} from '../../whiteboard-shape';
import {LinkPort} from '../link-port';
import {DrawingLayerManagerService} from '../../../../InfiniteCanvas/DrawingLayerManager/drawing-layer-manager.service';
import {Editable} from '../../../InterfaceEditable/editable';
import {EventEmitter} from '@angular/core';
import {LinkEvent} from '../LinkEvent/link-event';
import {LinkEventEnum} from '../LinkEvent/link-event-enum.enum';

export class DefaultLinkSetting{
  public static readonly DEFAULT_STROKE_COLOR = "black";
  public static readonly DEFAULT_STROKE_WIDTH = 1;
  public static readonly DEFAULT_FILL_COLOR = "black";
}

export class EditableLink implements Editable{
  private _linkObject:Path;
  private _tempLinkPath:Path;
  private _fromLinkPort:LinkPort;
  private _toLinkPort:LinkPort;
  private _linkHeadSize;

  private _startPoint:Point;
  private _endPoint:Point;

  private _midPoints:Array<Point>;

  private _layerService:DrawingLayerManagerService;

  private _fromLinkEventEmitter:EventEmitter<any>;
  private _toLinkEventEmitter:EventEmitter<any>;

  constructor(fromLinkPort: LinkPort, strokeColor?, strokeWidth?, fillColor? ) {
    strokeColor   = (strokeColor) ? (strokeColor) : (DefaultLinkSetting.DEFAULT_STROKE_COLOR);
    strokeWidth   = (strokeWidth) ? (strokeWidth) : (DefaultLinkSetting.DEFAULT_STROKE_WIDTH);
    fillColor     = (fillColor)   ? (fillColor)   : (DefaultLinkSetting.DEFAULT_FILL_COLOR);
    this.fromLinkPort = fromLinkPort;
    this.setFromLinkEventEmitter();

    this.layerService = this.fromLinkPort.owner.layerService;

    this.linkObject = EditableLink.createLinkObject(strokeColor, strokeWidth, fillColor);
  }
  private static createLinkObject(strokeColor?, strokeWidth?, fillColor?, segments?){
    strokeColor   = (strokeColor) ? (strokeColor) : (DefaultLinkSetting.DEFAULT_STROKE_COLOR);
    strokeWidth   = (strokeWidth) ? (strokeWidth) : (DefaultLinkSetting.DEFAULT_STROKE_WIDTH);
    fillColor     = (fillColor)   ? (fillColor)   : (DefaultLinkSetting.DEFAULT_FILL_COLOR);
    segments      = (segments)    ? (segments)    : ([]);

    return new Path({
      segments      : segments,
      strokeColor   : strokeColor,
      strokeWidth   : strokeWidth,
      fillColor     : fillColor,
      strokeCap     : 'round',
      strokeJoin    : 'round',
    });
  }

  // ####  임시링크 메서드
  public initTempLink(downPoint){
    this.startPoint = downPoint;
    this.tempLinkPath = EditableLink.createLinkObject();
  }
  public drawTempLink(draggedPoint){
    let hitWbShape:WhiteboardShape = this.layerService.getHittedItem(draggedPoint) as WhiteboardShape;


    if(hitWbShape && hitWbShape.id !== this.fromLinkPort.owner.id && hitWbShape.linkPortMap){
      //this.tempLinkToWbItem(hitWbShape, draggedPoint);
      draggedPoint = hitWbShape.linkPortMap
        .get(hitWbShape.getClosestLinkPort(draggedPoint)).calcLinkPortPosition();
    }

    this.tempLinkPath.removeSegments();

    let vector = this.startPoint.subtract(draggedPoint);

    let arrowVector = vector.normalize(25);
    // @ts-ignore
    let arrowLeftWing = draggedPoint.add(arrowVector.rotate(35));
    // @ts-ignore
    let arrowRightWing = draggedPoint.add(arrowVector.rotate(-35));

    this.tempLinkPath.add( this.fromLinkPort.calcLinkPortPosition() );
    this.tempLinkPath.add(draggedPoint);
    this.tempLinkPath.add(arrowLeftWing);
    this.tempLinkPath.add(draggedPoint);
    this.tempLinkPath.add(arrowRightWing);
    this.tempLinkPath.add(draggedPoint);
  }
  public destroyTempLink(){
    if(this.tempLinkPath){
      this.tempLinkPath.remove();
    }
  }
  // ####

  public destroyItem(){
    if(this.linkObject){
      this.linkObject.remove();
    }
  }
  // #### 실제 링크 메서드
  public linkToWbShape(upPoint)  : EditableLink{
    let hitWbShape:WhiteboardShape = this.layerService.getHittedItem(upPoint) as WhiteboardShape;

    this.destroyTempLink();

    if(hitWbShape && hitWbShape.id !== this.fromLinkPort.owner.id && hitWbShape.linkPortMap){
      //this.tempLinkToWbItem(hitWbShape, draggedPoint);
      let toLinkPort = hitWbShape.linkPortMap.get(hitWbShape.getClosestLinkPort(upPoint));
      upPoint = toLinkPort.calcLinkPortPosition();
      this.toLinkPort = toLinkPort;
      this.setToLinkEventEmitter();
    }
    else{
      return null;
    }

    this.tempLinkPath.removeSegments();

    let vector = this.startPoint.subtract(upPoint);

    let arrowVector = vector.normalize(25);
    // @ts-ignore
    let arrowLeftWing = upPoint.add(arrowVector.rotate(35));
    // @ts-ignore
    let arrowRightWing = upPoint.add(arrowVector.rotate(-35));

    this.linkObject.add( this.fromLinkPort.calcLinkPortPosition() );
    this.linkObject.add(upPoint);
    this.linkObject.add(arrowLeftWing);
    this.linkObject.add(upPoint);
    this.linkObject.add(arrowRightWing);
    this.linkObject.add(upPoint);

    this.linkObject.onFrame = (event)=>{
      this.refreshLink();
    };
    this.layerService.drawingLayer.addChild(this.linkObject);
    return this;
  }
  // ####

  // ####이벤트 발생기 핸들러
  private setFromLinkEventEmitter(){
    this.fromLinkEventEmitter = this.fromLinkPort.linkEventEmitter;
    this.fromLinkEventEmitter.subscribe((data:LinkEvent)=>{
      this.wbItemDestroyEventHandler(data);
    })
  }
  private setToLinkEventEmitter(){
    this.toLinkEventEmitter = this.toLinkPort.linkEventEmitter;
    this.toLinkEventEmitter.subscribe((data:LinkEvent)=>{
      this.wbItemDestroyEventHandler(data);
    })
  }
  private wbItemDestroyEventHandler(data:LinkEvent){
    if (data.action === LinkEventEnum.WB_ITEM_DESTROYED) {
      console.log("EditableLink >> LinkEventEnum >> WB_ITEM_DESTROYED : ", data.invokerItem);
      this.fromLinkEventEmitter.emit(new LinkEvent(LinkEventEnum.LINK_DESTROYED, this));
      this.destroyItem();
    }

  }
  // ####

  private static checkLinkingIsPossible(...vars){
    let isAvail = true;
    for(let i = 0 ; i < vars.length; i++){
      if(!vars[i]){
        isAvail = false;
      }
    }
    return isAvail;
  }

  // #### 링크 위치 재조정
  public refreshLink(){
    if(this.fromLinkPort && this.toLinkPort){
      this.linkObject.firstSegment.point = this.fromLinkPort.calcLinkPortPosition();
      this.linkObject.lastSegment.point = this.toLinkPort.calcLinkPortPosition();
    }
  }


  get linkObject(): paper.Path {
    return this._linkObject;
  }

  set linkObject(value: paper.Path) {
    this._linkObject = value;
  }


  get fromLinkPort(): LinkPort {
    return this._fromLinkPort;
  }

  set fromLinkPort(value: LinkPort) {
    this._fromLinkPort = value;
  }

  get toLinkPort(): LinkPort {
    return this._toLinkPort;
  }

  set toLinkPort(value: LinkPort) {
    this._toLinkPort = value;
  }

  get linkHeadSize() {
    return this._linkHeadSize;
  }

  set linkHeadSize(value) {
    this._linkHeadSize = value;
  }

  get startPoint(): paper.Point {
    return this._startPoint;
  }

  set startPoint(value: paper.Point) {
    this._startPoint = value;
  }

  get endPoint(): paper.Point {
    return this._endPoint;
  }

  set endPoint(value: paper.Point) {
    this._endPoint = value;
  }

  get midPoints(): Array<paper.Point> {
    return this._midPoints;
  }

  set midPoints(value: Array<paper.Point>) {
    this._midPoints = value;
  }

  get layerService(): DrawingLayerManagerService {
    return this._layerService;
  }

  set layerService(value: DrawingLayerManagerService) {
    this._layerService = value;
  }

  get tempLinkPath(): paper.Path {
    return this._tempLinkPath;
  }

  set tempLinkPath(value: paper.Path) {
    this._tempLinkPath = value;
  }




  get fromLinkEventEmitter(): EventEmitter<any> {
    return this._fromLinkEventEmitter;
  }

  set fromLinkEventEmitter(value: EventEmitter<any>) {
    this._fromLinkEventEmitter = value;
  }

  get toLinkEventEmitter(): EventEmitter<any> {
    return this._toLinkEventEmitter;
  }

  set toLinkEventEmitter(value: EventEmitter<any>) {
    this._toLinkEventEmitter = value;
  }
}
