import * as paper from 'paper';
import {LinkPort} from '../link-port';
import {DrawingLayerManagerService} from '../../../../InfiniteCanvas/DrawingLayerManager/drawing-layer-manager.service';
import {Editable} from '../../../InterfaceEditable/editable';
import {EventEmitter} from '@angular/core';
import {LinkEvent} from '../LinkEvent/link-event';
import {LinkEventEnum} from '../LinkEvent/link-event-enum.enum';
import {
  LinkerColorEnum,
  LinkerStrokeWidthLevelEnum
} from '../../../../InfiniteCanvas/DrawingLayerManager/LinkModeManagerService/LinkMode/linker-mode-enum.enum';
// @ts-ignore
import Path = paper.Path;
// @ts-ignore
import Point = paper.Point;
import {MouseButtonEventEnum} from '../../../../Pointer/MouseButtonEventEnum/mouse-button-event-enum.enum';

export abstract class EditableLink implements Editable{
  private _id;
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

  private _strokeColor;
  private _strokeWidth;
  private _fillColor;
  private _isDashed;
  private _dashLength = 0;

  protected static readonly DEFAULT_DASH_LENGTH = 5;

  protected constructor(fromLinkPort: LinkPort, strokeColor?, strokeWidth?, fillColor?, isDashed? ) {
    strokeColor   = (strokeColor) ? (strokeColor) : (LinkerColorEnum.BLACK);
    strokeWidth   = (strokeWidth) ? (strokeWidth) : (LinkerStrokeWidthLevelEnum.LEVEL_1);
    fillColor     = (fillColor)   ? (fillColor)   : (LinkerColorEnum.BLACK);
    isDashed      = (isDashed)    ? (isDashed)     : (false);

    this.strokeColor  = strokeColor;
    this.strokeWidth  = strokeWidth;
    this.fillColor    = fillColor;
    this._isDashed    = isDashed;

    if(isDashed){
      this._dashLength = this.strokeWidth + EditableLink.DEFAULT_DASH_LENGTH;
    }

    this.fromLinkPort = fromLinkPort;
    this.setFromLinkEventEmitter();

    this.layerService = this.fromLinkPort.owner.layerService;

    this.linkObject = this.createLinkObject();
    this.bindEventHandler(this.linkObject);
  }
  protected createLinkObject(){
    return new Path({
      strokeColor: this.strokeColor,
      strokeWidth: this.strokeWidth,
      fillColor: this.fillColor,
      strokeCap: 'round',
      strokeJoin: 'round',
      dashArray: [this._dashLength, this._dashLength]
    });
  }
  protected bindEventHandler(newPath){

    newPath.onMouseDown = (event)=>{
      console.log("EditableLink >> onMouseDown >> this : ",this);
    };
    newPath.onMouseUp = (event) =>{
      console.log("EditableLink >> onMouseUp >> this : ",this);
      switch (event.event.button) {
        case MouseButtonEventEnum.LEFT_CLICK:
          this.linkObject.selected = !this.linkObject.selected;
          this.linkObject.handleBounds.width = this.strokeWidth;
          break;
        case MouseButtonEventEnum.RIGHT_CLICK:
          break;
      }//switch
    }
  }

  // ####  임시링크 메서드
  public abstract initTempLink(downPoint);
  public abstract drawTempLink(draggedPoint);
  // #### 링크 위치 재조정
  public abstract refreshLink();
  // #### 실제 링크 메서드
  public abstract linkToWbShape(upPoint)  : EditableLink;

  protected onLinkEstablished(){
    this.id = this.layerService.getWbId();
    this.layerService.addWbLink(this);
  }

  // #### 링크 삭제 메서드
  public destroyTempLink(){
    if(this.tempLinkPath){
      this.tempLinkPath.remove();
    }
  }
  public destroyItem(){
    if(this.linkObject){
      this.linkObject.remove();
    }
    this.layerService.deleteWbLink(this);
  }
  // ####

  // ####이벤트 발생기 핸들러
  protected setFromLinkEventEmitter(){
    this.fromLinkEventEmitter = this.fromLinkPort.linkEventEmitter;
    this.fromLinkEventEmitter.subscribe((data:LinkEvent)=>{
      this.wbItemDestroyEventHandler(data);
    })
  }
  protected setToLinkEventEmitter(){
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

  get strokeColor() {
    return this._strokeColor;
  }

  set strokeColor(value) {
    this._strokeColor = value;
  }

  get strokeWidth() {
    return this._strokeWidth;
  }

  set strokeWidth(value) {
    this._strokeWidth = value;
  }

  get fillColor() {
    return this._fillColor;
  }

  set fillColor(value) {
    this._fillColor = value;
  }

  get isDashed() {
    return this._isDashed;
  }

  set isDashed(value) {
    this._isDashed = value;
  }

  get dashLength(): number {
    return this._dashLength;
  }

  set dashLength(value: number) {
    this._dashLength = value;
  }

  get id() {
    return this._id;
  }

  set id(value) {
    this._id = value;
  }
}
