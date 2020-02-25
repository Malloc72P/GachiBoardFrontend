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

import {WhiteboardItem} from '../whiteboard-item';
import {ItemLifeCycleEnum, ItemLifeCycleEvent} from '../WhiteboardItemLifeCycle/WhiteboardItemLifeCycle';
import {WhiteboardShape} from '../Whiteboard-Shape/whiteboard-shape';
import {ItemGroupDto} from '../../../../DTO/WhiteboardItemDto/ItemGroupDto/item-group-dto';
import {EditableLink} from "../Whiteboard-Shape/LinkPort/EditableLink/editable-link";
import {WsWhiteboardController} from '../../../../Controller/Controller-WebSocket/websocket-manager/WhiteboardWsController/ws-whiteboard.controller';

export class ItemGroup extends WhiteboardItem {
  private _wbItemGroup: Array<WhiteboardItem>;

  constructor(id, type, item: Item, layerService) {
    super(id, type, item, layerService);
    this.coreItem = this.group;
    this.wbItemGroup = new Array<WhiteboardItem>();
    console.log('ItemGroup >> constructor >> 진입함');

  }

  public amIAlreadyHaveThis(wbItem:WhiteboardItem){
    for(let i = 0 ; i < this.wbItemGroup.length; i++){
      let currentItem = this.wbItemGroup[i];
      if(currentItem.id === wbItem.id){
        return true;
      }
    }
    return false;
  }

  //### Mouse Event 콜백
  protected setCallback() {}
  public onMouseDown(event){
    if(!this.isMovable){
      return;
    }
    this.prevPoint = event.point;
    if(event.modifiers.control === true){
      this.setMultipleSelectMode();
    }
    if(event.modifiers.shift === true){
      this.setMultipleSelectMode();
    }
    if(event.modifiers.alt === true){

    }
    if( this.checkEditable() ){
      if (this.isSingleSelectMode()) {
      }
      else{
        let hitItem = this.layerService.getHittedItem(event.point);

        if(hitItem instanceof WhiteboardItem) {
          if(this.amIAlreadyHaveThis(hitItem)){
            this.layerService.globalSelectedGroup.extractOneFromGroup(hitItem);
          }
        }
      }
    }

  }

  public moveByDelta(event) {
    if(!this.isMovable) {
      return;
    }
    this.calcCurrentDistance(event);
    if(this.checkEditable()) {
      this.group.position.x += event.delta.x;
      this.group.position.y += event.delta.y;

      this.emitMoved();
      this.wbItemGroup.forEach(value => {
        value.emitMoved();
      });
    }
  }

  private moveTo(position: Point) {
    if(this.isMovable) {
      this.group.position = position;
      this.emitMoved();
      this.wbItemGroup.forEach(value => {
        value.emitMoved();
      });
    }
  }

  public resizeTo(bound: paper.Rectangle) {
    this.group.bounds = bound;
    this.emitResized();
    this.wbItemGroup.forEach(value => {
      value.emitResized();
    });
  }

  public onMouseDrag(event){
    if(!this.isMovable){
      return;
    }

    this.calcCurrentDistance(event);
    let currentPointerMode = this.layerService.currentPointerMode;
    this.calcCurrentDistance(event);
    if( this.checkEditable()  ) {
      this.group.position.x += event.delta.x;
      this.group.position.y += event.delta.y;
    }
  }

  public resizeEnd(){
    console.log("ItemGroup >> resizeEnd >> 진입함");
    console.log("ItemGroup >> resizeEnd >> this.wbItemGroup : ",this.wbItemGroup);
    let wsWbController = WsWhiteboardController.getInstance();
    for(let wbItem of this.wbItemGroup){
      wsWbController.waitRequestUpdateWbItem(wbItem, ItemLifeCycleEnum.RESIZED);
    }
  }
  public moveEnd() {
    this.wbItemGroup.forEach(value => {
      value.emitModify();
    });
    this.emitModify();
    let wsWbController = WsWhiteboardController.getInstance();
    for(let wbItem of this.wbItemGroup){
      wsWbController.waitRequestUpdateWbItem(wbItem, ItemLifeCycleEnum.MOVED)
        .subscribe((data)=>{
          console.log("ItemGroup >>  >> data : ",data);
        });
    }
  }


  public onMouseUp(event){
    this.calcCurrentDistance(event);
    if(!this.isMovable){
      return;
    }

    this.resetDistance();
    this.setSingleSelectMode();
    this.globalLifeCycleEmitter.emit(new ItemLifeCycleEvent(this.id,this,ItemLifeCycleEnum.MODIFY));
    // this.wbItemGroup.forEach((value, index, array)=>{
    //   value.refreshItem();
    // })
  }


  public resetMyItemAdjustor(){
    if(this.getNumberOfChild() === 1 && this.wbItemGroup[0] instanceof EditableLink){
      this.deactivateSelectedMode();
    } else if(this.getNumberOfChild() > 0) {
      this.activateSelectedMode();
    } else {
      this.deactivateSelectedMode();
    }
  }

  private retractGroup(){
    this.group.bounds = new paper.Rectangle(new Point(0,0), new Point(0,0));
  }

  public relocateItemGroup(newPosition){
    this.moveTo(newPosition);
    this.layerService.horizonContextMenuService.refreshPosition();
  }

  public insertOneIntoGroup(wbItem: WhiteboardItem) {
    if(this.amIAlreadyHaveThis(wbItem)){
      return false;
    }
    this.wbItemGroup.push(wbItem);
    wbItem.isSelected = true;
    this.coreItem.addChild(wbItem.group);
    this.group.bringToFront();
    if(this.getNumberOfChild() > 1) {
      this.wbItemGroup[0].emitDeselected();
    } else {
      wbItem.emitSelected();
    }
  }

  public extractOneFromGroup(wbItem: WhiteboardItem) {

    for (let i = 0; i < this.wbItemGroup.length; i++) {
      if (this.wbItemGroup[i].id === wbItem.id) {
        let drawingLayer = this.coreItem.parent;
        //자식을 drawingLayer 로 옮겨줌.
        let willBeExtract = this.wbItemGroup[i];
        willBeExtract.isSelected = false;
        if(willBeExtract instanceof WhiteboardShape){
          willBeExtract.linkPortMap.forEach((value, key, map)=>{
            value.emitWbItemDeselected();
          });
        }
        drawingLayer.addChild(willBeExtract.group);
        this.wbItemGroup.splice(i, 1);
        this.resetMyItemAdjustor();
        willBeExtract.emitDeselected();

        if(this.getNumberOfChild() === 1) {
          this.wbItemGroup[0].emitSelected();
        }

        return;
      }
    }
  }
  public destroyOneFromGroup(wbItem: WhiteboardItem) {

    for (let i = 0; i < this.wbItemGroup.length; i++) {
      if (this.wbItemGroup[i].id === wbItem.id) {
        let willBeDestroyed = this.wbItemGroup[i];

        this.wbItemGroup.splice(i, 1);
        this.resetMyItemAdjustor();
        willBeDestroyed.destroyItem();

        return;
      }
    }
  }

  public extractAllFromGroup() {
    let drawingLayer = this.coreItem.parent;
    for (let i = 0; i < this.wbItemGroup.length; i++) {
      //자식을 drawingLayer로 옮겨줌.
      let willBeExtract = this.wbItemGroup[i];
      willBeExtract.isSelected = false;
      if(willBeExtract instanceof WhiteboardShape){
        willBeExtract.linkPortMap.forEach((value, key, map)=>{
          value.emitWbItemDeselected();
        });
      }
      drawingLayer.addChild(willBeExtract.group);
      willBeExtract.emitDeselected();
    }
    this.wbItemGroup.splice(0, this.wbItemGroup.length);
    this.resetMyItemAdjustor();
  }
  public destroyAllFromGroup() {
    for (let i = 0; i < this.wbItemGroup.length; i++) {

      let willBeDestroy = this.wbItemGroup[i];
      willBeDestroy.destroyItem();
    }
    this.wbItemGroup.splice(0, this.wbItemGroup.length);

    this.layerService.horizonContextMenuService.close();
    this.resetMyItemAdjustor();
  }


  destroyItem() {
    super.destroyItem();
    //unGroup하는 작업 실시
    this.coreItem.remove();
    this.globalLifeCycleEmitter.emit(new ItemLifeCycleEvent(this.id, this, ItemLifeCycleEnum.DESTROY));
  }
  destroyItemAndNoEmit() {
    super.destroyItem();
    //unGroup하는 작업 실시
    this.coreItem.remove();
  }

  destroyItemAndChildren() {
    for (let i = 0; i < this._wbItemGroup.length; i++) {
      console.log("ItemGroup >> destroyItemAndChildren >> this.wbItemGroup[i] : ", this.wbItemGroup[i]);
      this.wbItemGroup[i].destroyItem();
    }
    this.deactivateSelectedMode();
    // this.removeBackgroundRect();
  }

  public getNumberOfChild() {
    return this.wbItemGroup.length;
  }

  public notifyItemCreation() {
    this.globalLifeCycleEmitter.emit(new ItemLifeCycleEvent(this.id, this, ItemLifeCycleEnum.CREATE));
  }

  public notifyItemModified() {
    this.globalLifeCycleEmitter.emit(new ItemLifeCycleEvent(this.id, this, ItemLifeCycleEnum.MODIFY));
  }

  exportToDto(): ItemGroupDto {
    let itemGroupDto:ItemGroupDto = super.exportToDto() as ItemGroupDto;
    itemGroupDto.wbItemIdGroup = new Array<number>();

    for (let i = 0; i < this.wbItemGroup.length; i++) {
      itemGroupDto.wbItemIdGroup.push(this.wbItemGroup[i].id);
    }

    return itemGroupDto
  }

  public refreshItem() {
    // this.wbItemGroup.forEach((value, index, array)=>{
    //   value.refreshItem();
    // });
    this.globalLifeCycleEmitter.emit(new ItemLifeCycleEvent(this.id, this, ItemLifeCycleEnum.MODIFY));
  }


  get wbItemGroup(): Array<WhiteboardItem> {
    return this._wbItemGroup;
  }

  set wbItemGroup(value: Array<WhiteboardItem>) {
    this._wbItemGroup = value;
  }

  //
  // get backgroundRect(): paper.Path.Rectangle {
  //   return this._backgroundRect;
  // }
  //
  // set backgroundRect(value: paper.Path.Rectangle) {
  //   this._backgroundRect = value;
  // }
}
