
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

import * as paper from 'paper';
// @ts-ignore
import Path = paper.Path;
// @ts-ignore
import Point = paper.Point;
// @ts-ignore
import Circle = paper.Path.Circle;

import {MouseButtonEventEnum} from '../../../../Pointer/MouseButtonEventEnum/mouse-button-event-enum.enum';
import {LinkAdjustorPositionEnum} from './linkAdjustorPositionEnum/link-adjustor-position-enum.enum';
import {HandlerOption, ItemAdjustor} from '../../../ItemAdjustor/item-adjustor';
import {WhiteboardShape} from '../../whiteboard-shape';
import {WhiteboardShapeDto} from '../../../../WhiteboardItemDto/WhiteboardShapeDto/whiteboard-shape-dto';
import {GachiColorDto} from '../../../../WhiteboardItemDto/ColorDto/gachi-color-dto';
import {EditableLinkDto} from '../../../../WhiteboardItemDto/WhiteboardShapeDto/LinkPortDto/EditableLinkDto/editable-link-dto';
import {WhiteboardItemType} from '../../../../../Helper/data-type-enum/data-type.enum';

export abstract class EditableLink implements Editable{
  private _id;
  private _type;
  private _linkObject:Path;
  private _tempLinkPath:Path;
  private _fromLinkPort:LinkPort;
  private _toLinkPort:LinkPort;
  private _linkHeadSize;

  private _isSelected = false;

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

  protected linkAdjustors:Map<any, Circle>;

  protected constructor(type, fromLinkPort: LinkPort, strokeColor?, strokeWidth?, fillColor?, isDashed?) {
    strokeColor   = (strokeColor) ? (strokeColor) : (LinkerColorEnum.BLACK);
    strokeWidth   = (strokeWidth) ? (strokeWidth) : (LinkerStrokeWidthLevelEnum.LEVEL_1);
    fillColor     = (fillColor)   ? (fillColor)   : (LinkerColorEnum.BLACK);
    isDashed      = (isDashed)    ? (isDashed)     : (false);

    this._type = type;

    this.linkAdjustors = new Map<any, Circle>();

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
    };
    newPath.onMouseUp = (event) =>{
      console.log("EditableLink >> onMouseUp >> this : ",this);
      switch (event.event.button) {
        case MouseButtonEventEnum.LEFT_CLICK:
          this._isSelected = true;
          this.fromLinkEventEmitter.emit(new LinkEvent(LinkEventEnum.LINK_CLICKED, this));
          break;
        case MouseButtonEventEnum.RIGHT_CLICK:
          break;
      }//switch
    }
  }
  protected activateAdjustMode(){

  }
  protected deactivateAdjustMode(){

  }

  // ####  임시링크 메서드
  public abstract initTempLink(downPoint);
  public abstract drawTempLink(draggedPoint);
  // #### 링크 위치 재조정
  public abstract refreshLink();
  // #### 실제 링크 메서드
  public abstract linkToWbShape(upPoint)  : EditableLink;
  public abstract manuallyLinkToWbShape(toWbShape:WhiteboardShape, toLinkPortDirection) : EditableLink;

  protected onLinkEstablished(){
    let adjustorCircle = new Circle( this.linkObject.lastSegment.point, HandlerOption.circleRadius );
    // @ts-ignore
    adjustorCircle.fillColor = HandlerOption.fillColor;
    // @ts-ignore
    adjustorCircle.strokeColor = HandlerOption.strokeColor;

    adjustorCircle.visible = false;

    let prevIsSelected = this._isSelected;
    adjustorCircle.onFrame = (event)=>{
      if(this.linkObject.lastSegment){
        if(prevIsSelected !== this._isSelected){
          adjustorCircle.visible = this._isSelected;
          prevIsSelected = this._isSelected;
        }
        if(this._isSelected){
          adjustorCircle.position = this.linkObject.lastSegment.point;
          adjustorCircle.bringToFront();
        }

      }
    };
    adjustorCircle.onMouseDown = (event)=>{
      console.log("EditableLink >> onMouseDown >> 진입함");
      this.hideLinkObject();
      this.initTempLink(event.point);
      //this.linkObject.lastSegment.point = event.point;
    };
    adjustorCircle.onMouseDrag = (event)=>{
      console.log("EditableLink >> onMouseDrag >> 진입함");
      this.drawTempLink(event.point);
      //this.linkObject.lastSegment.point = event.point;
    };
    adjustorCircle.onMouseUp = (event)=>{
      console.log("EditableLink >> onMouseUp >> 진입함");
      this.destroyTempLink();
      //####
      let point = event.point;
      let hitWbShape:WhiteboardShape = this.layerService.getHittedItem(point) as WhiteboardShape;
      if(hitWbShape && hitWbShape.id !== this.fromLinkPort.owner.id && hitWbShape.linkPortMap){
        console.log("EditableLink >> onMouseUp >> hitWbShape");

        let toLinkPort = hitWbShape.linkPortMap.get(hitWbShape.getClosestLinkPort(point));

        if(toLinkPort === this.toLinkPort){
          this.showLinkObject();
          return;
        }

        this.toLinkPort = toLinkPort;
        this.setToLinkEventEmitter();
      }
      else {
        console.log("EditableLink >> onMouseUp >> hit failed");
      }
      this.showLinkObject();
    };
    this.linkAdjustors.set(LinkAdjustorPositionEnum.END_OF_LINK, adjustorCircle);
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
    if(this.linkAdjustors){
      this.linkAdjustors.forEach((value, key, map)=>{
        value.remove();
      });
    }
    this.layerService.deleteWbLink(this);
  }
  public hideLinkObject(){
    this.linkObject.visible = false;
  }
  public showLinkObject(){
    this.linkObject.visible = true;
  }
  // ####

  // ####이벤트 발생기 핸들러
  protected setFromLinkEventEmitter(){
    this.fromLinkEventEmitter = this.fromLinkPort.linkEventEmitter;
    this.fromLinkEventEmitter.subscribe((data:LinkEvent)=>{
      this.setLinkEventHandler(data);
    });
  }
  protected setToLinkEventEmitter(){
    this.toLinkEventEmitter = this.toLinkPort.linkEventEmitter;
    this.toLinkEventEmitter.subscribe((data:LinkEvent)=>{
      this.setLinkEventHandler(data);
    });
  }
  private setLinkEventHandler(data:LinkEvent){
    switch (data.action) {
      case LinkEventEnum.WB_ITEM_DESTROYED:
        this.wbItemDestroyEventHandler(data);
        break;
      case LinkEventEnum.WB_ITEM_SELECTED:
        //this.wbItemSelectEventHandler(data);
        break;
      case LinkEventEnum.WB_ITEM_DESELECTED:
        this.wbItemDeselectEventHandler(data);
        break;
    }
  }
  private wbItemDestroyEventHandler(data:LinkEvent){
    this.fromLinkEventEmitter.emit(new LinkEvent(LinkEventEnum.LINK_DESTROYED, this));
    this.destroyItem();
  }
  private wbItemSelectEventHandler(data:LinkEvent){
    this._isSelected = true;
  }
  private wbItemDeselectEventHandler(data:LinkEvent){
    this._isSelected = false;
  }
  // ####

  exportToDto(): EditableLinkDto {
    return new EditableLinkDto(
      this.id,
      this.type,
      this.fromLinkPort.owner.id,
      this.fromLinkPort.direction,
      this.toLinkPort.owner.id,
      this.toLinkPort.direction,
      this.isDashed,
      this.dashLength,
      GachiColorDto.createColor(this.linkObject.strokeColor),
      this.linkObject.strokeWidth,
      GachiColorDto.createColor(this.linkObject.fillColor),
      null,
    );
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

  get isSelected(): boolean {
    return this._isSelected;
  }

  set isSelected(value: boolean) {
    this._isSelected = value;
  }

  get type() {
    return this._type;
  }

  set type(value) {
    this._type = value;
  }
}
