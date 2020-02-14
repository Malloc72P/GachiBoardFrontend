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
import {WhiteboardShape} from '../../whiteboard-shape';
import {GachiColorDto} from '../../../../WhiteboardItemDto/ColorDto/gachi-color-dto';
import {EditableLinkDto} from '../../../../WhiteboardItemDto/WhiteboardShapeDto/LinkPortDto/EditableLinkDto/editable-link-dto';
import {LinkAdjustorPositionEnum} from "./LinkAdjustorPositionEnum/link-adjustor-position-enum.enum";
import {LinkHandler} from "./LinkHandler/link-handler";
import {ItemLifeCycleEnum, ItemLifeCycleEvent} from "../../../WhiteboardItemLifeCycle/WhiteboardItemLifeCycle";
// @ts-ignore
import Path = paper.Path;
// @ts-ignore
import Point = paper.Point;
import {Subscription} from "rxjs";

export abstract class EditableLink implements Editable {
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
  private _linkEventEmitter = new EventEmitter<LinkEvent>();
  private fromPortOwnerSubscription: Subscription;
  private toPortOwnerSubscription: Subscription;

  private _strokeColor;
  private _strokeWidth;
  private _fillColor;
  private _isDashed;
  private _dashLength = 0;

  protected static readonly DEFAULT_DASH_LENGTH = 5;

  private readonly _linkHandles :Map<any, LinkHandler>;

  protected constructor(type, fromLinkPort: LinkPort, strokeColor?, strokeWidth?, fillColor?, isDashed?) {
    strokeColor   = (strokeColor) ? (strokeColor) : (LinkerColorEnum.BLACK);
    strokeWidth   = (strokeWidth) ? (strokeWidth) : (LinkerStrokeWidthLevelEnum.LEVEL_1);
    fillColor     = (fillColor)   ? (fillColor)   : (LinkerColorEnum.BLACK);
    isDashed      = (isDashed)    ? (isDashed)     : (false);

    this._type = type;

    this._linkHandles = new Map<any, LinkHandler>();

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
  }

  protected subscribeOwnerLifeCycleEvent() {
    if(!!this.fromPortOwnerSubscription) {
      this.fromPortOwnerSubscription.unsubscribe();
    }
    if(!!this.toPortOwnerSubscription) {
      this.toPortOwnerSubscription.unsubscribe();
    }

    this.fromPortOwnerSubscription = this.fromLinkPort.owner.lifeCycleEmitter.subscribe((event: ItemLifeCycleEvent) => {
      if(event.action === ItemLifeCycleEnum.MOVED || event.action === ItemLifeCycleEnum.RESIZED) {
        this.refreshLink();
      }
    });
    this.toPortOwnerSubscription = this.toLinkPort.owner.lifeCycleEmitter.subscribe((event: ItemLifeCycleEvent) => {
      if(event.action === ItemLifeCycleEnum.MOVED || event.action === ItemLifeCycleEnum.RESIZED) {
        this.refreshLink();
      }
    });
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
    let linkHandler = new LinkHandler(this, 'skyblue');
    this._linkHandles.set(LinkAdjustorPositionEnum.END_OF_LINK, linkHandler);
    /*this.id = this.layerService.getWbId();
    this.layerService.addWbLink(this);*/
  }

  public select() {
    this.linkEventEmitter.emit(new LinkEvent(LinkEventEnum.WB_ITEM_SELECTED, this));
    this.isSelected = true;
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
    if(this._linkHandles){
      this._linkHandles.forEach((value, key, map)=>{
        value.destroy();
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
  public setFromLinkEventEmitter(){
    this.fromLinkEventEmitter = this.fromLinkPort.linkEventEmitter;
    this.fromLinkEventEmitter.subscribe((data:LinkEvent)=>{
      this.setLinkEventHandler(data);
    });
  }
  public setToLinkEventEmitter(){
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
    if(!!this.toLinkEventEmitter) {
      this.toLinkEventEmitter.emit(new LinkEvent(LinkEventEnum.WB_ITEM_MODIFIED, this));
    }
    this._toLinkPort = value;
  }

  get isHide(): boolean {
    return this.linkObject.visible;
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

  get linkHandles(): Map<any, LinkHandler> {
    return this._linkHandles;
  }

  get linkEventEmitter(): EventEmitter<LinkEvent> {
    return this._linkEventEmitter;
  }
}
