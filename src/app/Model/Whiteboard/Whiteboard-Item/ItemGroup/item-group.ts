import {WhiteboardItem} from '../whiteboard-item';
import {PositionCalcService} from '../../PositionCalc/position-calc.service';
import {EventEmitter} from '@angular/core';

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
import Rectangle = paper.Path.Rectangle;

import {ItemLifeCycleEnum, ItemLifeCycleEvent} from '../WhiteboardItemLifeCycle/WhiteboardItemLifeCycle';
import {EditableStroke} from '../editable-stroke/editable-stroke';
import {TextStyle} from '../../Pointer/shape-service/text-style';
import {EditableShape} from '../Whiteboard-Shape/EditableShape/editable-shape';
import {WhiteboardShape} from '../Whiteboard-Shape/whiteboard-shape';
import {ItemGroupDto} from '../../WhiteboardItemDto/ItemGroupDto/item-group-dto';

export class ItemGroup extends WhiteboardItem {
  private _wbItemGroup: Array<WhiteboardItem>;
  private _backgroundRect: Rectangle;

  constructor(id, type, item: Item, layerService) {
    super(id, type, item, layerService);
    this.coreItem = this.group;
    this.wbItemGroup = new Array<WhiteboardItem>();
    console.log('ItemGroup >> constructor >> 진입함');
    let prevNumberOfChildren = this.getNumberOfChild();

    this.createBackgroundRect();
    this.coreItem.onFrame = (event) => {
      let currNumberOfChildren = this.getNumberOfChild();
      if (prevNumberOfChildren !== currNumberOfChildren) {

        this.resetMyItemAdjustor();

        prevNumberOfChildren = this.getNumberOfChild();
      }
    };
    this.activateShadowEffect();
  }

  protected amIAlreadyHaveThis(wbItem:WhiteboardItem){
    for(let i = 0 ; i < this.wbItemGroup.length; i++){
      let currentItem = this.wbItemGroup[i];
      if(currentItem.id === wbItem.id){
        return true;
      }
    }
    return false;
  }
  private removeBackgroundRect() {
    if (this.backgroundRect) {
      this.backgroundRect.remove();
    }
  }

  private createBackgroundRect() {
    this.removeBackgroundRect();
    this.backgroundRect = new Rectangle(
      new Point(this.group.bounds.topLeft.x, this.group.bounds.topLeft.y),
      new Point(this.group.bounds.bottomRight.x, this.group.bounds.bottomRight.y),
    );
    this.wbItemGroup.forEach((value, index, array)=>{
      if(value.group){
        value.group.bringToFront();
      }
    });
    this.group.bringToFront();
    this.backgroundRect.bringToFront();
    if(this.myItemAdjustor){
      this.myItemAdjustor.bringToFront();
    }
    this.group.addChild(this.backgroundRect);

    // @ts-ignore
    //this.backgroundRect.fillColor = 'transparent';
    this.backgroundRect.fillColor = "skyblue";
    this.backgroundRect.opacity = 0.2;
    this.backgroundRect.name = 'BackgroundRect';

    this.backgroundRect.onMouseDown = (event) => {
      this.onMouseDown(event);
    };
    this.backgroundRect.onMouseDrag = (event) => {
      this.onMouseDrag(event);
      // TODO : HorizonContextMenuService Test Code
      this.layerService.horizonContextMenuService.close();
    };
    this.backgroundRect.onMouseUp = (event) => {
      this.onMouseUp(event);
      // TODO : HorizonContextMenuService Test Code
      this.layerService.horizonContextMenuService.open();
    };
    this.backgroundRect.onDoubleClick = ()=>{
      console.log("ItemGroup >> onDoubleClick >> 진입함");
    }

  }

  //### Mouse Event 콜백
  protected setCallback() {}
  protected onMouseDown(event){
    if(!this.checkMovable()){
      return;
    }
    console.log("ItemGroup >> onMouseDown >> event : ",event);
    this.prevPoint = event.point;
    if(event.modifiers.control === true){
      //this.layerService.globalSelectedGroup.setMultipleSelectMode(this);
      this.setMultipleSelectMode();
    }
    if(event.modifiers.shift === true){
      //this.layerService.globalSelectedGroup.setMultipleSelectMode(this);
      this.setMultipleSelectMode();
    }
    if(event.modifiers.alt === true){

    }
    if( this.checkEditable() ){
      if (this.isSingleSelectMode()) {
      }
      else{
        let hitItem = this.layerService.getHittedItem(event.point);

        if(this.amIAlreadyHaveThis(hitItem)){
          this.layerService.globalSelectedGroup.extractOneFromGroup(hitItem);
        }
      }
    }

  }
  protected onMouseDrag(event){
    if(!this.checkMovable()){
      return;
    }
    //this.deactivateSelectedMode();
    if(this.myItemAdjustor){
      this.myItemAdjustor.disable();
    }
    this.calcCurrentDistance(event);
    let currentPointerMode = this.layerService.currentPointerMode;
    this.calcCurrentDistance(event);
    if( this.checkEditable()  ) {
      //this.group.position = event.point;
      this.group.position.x += event.delta.x;
      this.group.position.y += event.delta.y;
    }
  }
  protected onMouseUp(event){
    this.calcCurrentDistance(event);
    if(!this.checkMovable()){
      return;
    }
    if(this.myItemAdjustor){
      this.myItemAdjustor.enable();
      this.resetMyItemAdjustor();
    }

    this.resetDistance();
    this.setSingleSelectMode();
    this.lifeCycleEventEmitter.emit(new ItemLifeCycleEvent(this.id,this,ItemLifeCycleEnum.MODIFY));
    this.wbItemGroup.forEach((value, index, array)=>{
      value.refreshItem();
    })
  }


  public resetMyItemAdjustor(){
    if(this.getNumberOfChild() === 1){
      this.activateSelectedMode();
      this.createBackgroundRect();
    }
    if(this.getNumberOfChild() === 0){
      this.deactivateSelectedMode();
      this.removeBackgroundRect();
    }
    //this.deactivateSelectedMode();
    //this.activateSelectedMode();
    if(this.myItemAdjustor){
      this.myItemAdjustor.refreshItemAdjustorSize();
      this.createBackgroundRect();
      this.refreshLinkHandler();
    }
  }
  private refreshLinkHandler(){
    if(this.getNumberOfChild() === 1){
      if( this.wbItemGroup[0] instanceof EditableStroke ){
        //this.myItemAdjustor.disableLinkHandlers();
      }
      else{
        //this.myItemAdjustor.enableLinkHandlers();
      }
    }
    else{
      //this.myItemAdjustor.disableLinkHandlers();
    }
  }
  private retractGroup(){
    this.backgroundRect.remove();
    // @ts-ignore
    this.group.bounds = new Rectangle(new Point(0,0), new Point(0,0));
  }

  public relocateItemGroup(newPosition){
    if(this.myItemAdjustor){
      this.group.position = newPosition;
      this.myItemAdjustor.refreshItemAdjustorSize();
    }
  }

  public insertOneIntoGroup(wbItem: WhiteboardItem) {
    if(this.amIAlreadyHaveThis(wbItem)){
      return false;
    }
    this.wbItemGroup.push(wbItem);
    wbItem.isSelected = true;
    this.coreItem.addChild(wbItem.group);

    this.resetMyItemAdjustor();
  }

  public extractOneFromGroup(wbItem: WhiteboardItem) {

    for (let i = 0; i < this.wbItemGroup.length; i++) {
      if (this.wbItemGroup[i].id === wbItem.id) {
        let drawingLayer = this.coreItem.parent;
        //자식을 drawingLayer로 옮겨줌.
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
        willBeExtract.refreshItem();
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
      willBeExtract.refreshItem();
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
    this.lifeCycleEventEmitter.emit(new ItemLifeCycleEvent(this.id, this, ItemLifeCycleEnum.DESTROY));
  }

  destroyItemAndChildren() {
    for (let i = 0; i < this._wbItemGroup.length; i++) {
      console.log("ItemGroup >> destroyItemAndChildren >> this.wbItemGroup[i] : ", this.wbItemGroup[i]);
      this.wbItemGroup[i].destroyItem();
    }
    this.deactivateSelectedMode();
    this.removeBackgroundRect();
    // this.destroyItem();
  }

  public getNumberOfChild() {
    return this.wbItemGroup.length;
  }

  public notifyItemCreation() {
    this.lifeCycleEventEmitter.emit(new ItemLifeCycleEvent(this.id, this, ItemLifeCycleEnum.CREATE));
  }

  public notifyItemModified() {
    this.lifeCycleEventEmitter.emit(new ItemLifeCycleEvent(this.id, this, ItemLifeCycleEnum.MODIFY));
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
    this.wbItemGroup.forEach((value, index, array)=>{
      value.refreshItem();
    });
    this.lifeCycleEventEmitter.emit(new ItemLifeCycleEvent(this.id, this, ItemLifeCycleEnum.MODIFY));
  }


  get wbItemGroup(): Array<WhiteboardItem> {
    return this._wbItemGroup;
  }

  set wbItemGroup(value: Array<WhiteboardItem>) {
    this._wbItemGroup = value;
  }


  get backgroundRect(): paper.Path.Rectangle {
    return this._backgroundRect;
  }

  set backgroundRect(value: paper.Path.Rectangle) {
    this._backgroundRect = value;
  }
}
