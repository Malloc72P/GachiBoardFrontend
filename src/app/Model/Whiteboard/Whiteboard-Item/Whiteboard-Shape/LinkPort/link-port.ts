import {WhiteboardShape} from '../whiteboard-shape';
import {LinkPortDirectionEnum} from './LinkPortDirectionEnum/link-port-direction-enum.enum';

import * as paper from 'paper';
// @ts-ignore
import Point = paper.Point;
// @ts-ignore
import Circle = paper.Path.Circle;

import {PositionCalcService} from '../../../PositionCalc/position-calc.service';
import {HandlerOption} from '../../ItemAdjustor/item-adjustor';
import {ZoomEvent} from '../../../InfiniteCanvas/ZoomControl/ZoomEvent/zoom-event';
import {ZoomEventEnum} from '../../../InfiniteCanvas/ZoomControl/ZoomEvent/zoom-event-enum.enum';
import {DrawingLayerManagerService} from '../../../InfiniteCanvas/DrawingLayerManager/drawing-layer-manager.service';
import {EventEmitter} from '@angular/core';
import {LinkEvent} from './LinkEvent/link-event';
import {LinkEventEnum} from './LinkEvent/link-event-enum.enum';
import {EditableLink} from './EditableLink/editable-link';
import {LinkerModeEnum} from '../../../InfiniteCanvas/DrawingLayerManager/LinkModeManagerService/LinkMode/linker-mode-enum.enum';
import {SimpleLineLink} from './EditableLink/SimpleLineLink/simple-line-link';
import {SimpleArrowLink} from './EditableLink/SimpleArrowLink/simple-arrow-link';
import {LinkPortDto} from '../../../WhiteboardItemDto/WhiteboardShapeDto/LinkPortDto/link-port-dto';
import {EditableLinkDto} from '../../../WhiteboardItemDto/WhiteboardShapeDto/LinkPortDto/EditableLinkDto/editable-link-dto';

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
  public emitWbItemDeselected(){
    this.linkEventEmitter.emit(new LinkEvent(LinkEventEnum.WB_ITEM_DESELECTED, this));
  }
  private setLinkEventHandler(){
    this.linkEventEmitter = new EventEmitter<any>();
    this.linkEventEmitter.subscribe((data:LinkEvent)=>{
      if(data.action === LinkEventEnum.LINK_DESTROYED){
        console.log("LinkPort >> linkEventEmitter >> data : ",data.invokerItem);
        this.owner.notifyItemModified();
      }
      else if(data.action === LinkEventEnum.LINK_CLICKED){
        if(!this.owner.isSelected){
          this.layerService.globalSelectedGroup.isLinkSelected = true;
          this.layerService.globalSelectedGroup.insertOneIntoSelection(this.owner);
          this.linkEventEmitter.emit(new LinkEvent(LinkEventEnum.WB_ITEM_SELECTED, this));
        }
      }
    });
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
    this.handlerCircleObject.strokeWidth = handlerOption.strokeWidth / zoomFactor;
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

  public onMouseDown(event) {
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
  }

  public onMouseDrag(event) {
    this.tempLink.drawTempLink(event.point);
  }

  public onMouseUp (event) {
    let point = event.point;

    let newLink = this.tempLink.linkToWbShape(point);
    if(newLink){
      this.addLink(newLink);
    }
    else{
      if (this.tempLink) {
        this.tempLink.destroyItem();
        delete this.tempLink;
      }
    }
  }

  private setMouseCallback(){
    this.handlerCircleObject.onMouseDown = (event)=>{
      let currentLinkerMode = this.layerService.currentLinkerMode;

      let strokeWidth = currentLinkerMode.strokeWidth;
      let strokeColor = currentLinkerMode.strokeColor;
      let fillColor   = currentLinkerMode.fillColor;

      //this.owner.myItemAdjustor.hide;

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
        this.addLink(newLink);
      }
      else{
        if (this.tempLink) {
          this.tempLink.destroyItem();
          delete this.tempLink;
        }
      }
    };
  }

  public addLink(newLink){
    this.fromLinkList.splice(this.fromLinkList.length, 0, newLink);
    let toLinkList = newLink.toLinkPort.toLinkList;
    toLinkList.splice(toLinkList.length, 0, newLink);
    this.owner.notifyItemModified();
    newLink.id = this.layerService.getWbId();
    this.layerService.addWbLink(newLink);
    newLink.toLinkPort.owner.notifyItemModified();
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
  public getSelectedLinkIdx(){
    let children = this.fromLinkList;
    for (let i = 0; i < children.length; i++) {
      if(children[i].isSelected){
        return i;
      }
    }
    return -1;
  }
  public removeLinkById(id){
    this.fromLinkList.splice(id, 1);
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
          LinkPort.HANDLER_MARGIN / zoomFactor
        );
        this.handlerCircleObject.position = this.posCalcService.movePointBottom(
          this.handlerCircleObject.position,
          LinkPort.HANDLER_MARGIN / zoomFactor
        );
        return;
      case LinkPortDirectionEnum.BOTTOM_RIGHT:
        this.handlerCircleObject.position = this.posCalcService.movePointRight(
          this.handlerCircleObject.position,
          LinkPort.HANDLER_MARGIN / zoomFactor
        );
        this.handlerCircleObject.position = this.posCalcService.movePointBottom(
          this.handlerCircleObject.position,
          LinkPort.HANDLER_MARGIN / zoomFactor
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
    this.tempLink.tempLinkPath.onFrame = ()=>{};
  }

  exportToDto(): LinkPortDto {
    let fromLinkDtoList = new Array<EditableLinkDto>();
    let toLinkDtoList = new Array<EditableLinkDto>();

    this.fromLinkList.forEach((value, index, array)=>{
      fromLinkDtoList.push(value.exportToDto());
    });
    this.toLinkList.forEach((value, index, array)=>{
      toLinkDtoList.push(value.exportToDto());
    });
    return new LinkPortDto(
      this.direction,
      this.owner.id,
      fromLinkDtoList,
      toLinkDtoList
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
