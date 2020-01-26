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

export class ItemGroup extends WhiteboardItem {
  private _wbItemGroup: Array<WhiteboardItem>;
  private _backgroundRect: Rectangle;

  constructor(type, item: Item, layerService) {
    super(type, item, layerService);
    this.coreItem = this.group;
    this.wbItemGroup = new Array<WhiteboardItem>();
    console.log('ItemGroup >> constructor >> 진입함');
    let prevNumberOfChildren = this.coreItem.children.length;

    this.createBackgroundRect();
    this.coreItem.onFrame = (event) => {
      let currNumberOfChildren = this.coreItem.children.length;
      if (prevNumberOfChildren !== currNumberOfChildren) {

        this.resetMyItemAdjustor();

        prevNumberOfChildren = this.coreItem.children.length;
      }
    };
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
      this.group.bounds.topLeft,
      this.group.bounds.bottomRight,
    );
    this.backgroundRect.bringToFront();
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
    };
    this.backgroundRect.onMouseUp = (event) => {
      this.onMouseUp(event);
    };
  }

  //### Mouse Event 콜백
  protected setCallback() {}
  protected onMouseDown(event){
    if(!this.checkSelectable()){
      return;
    }
    this.prevPoint = event.point;
    if(event.modifiers.control === true){
      console.log("ItemGroup >> onMouseDown >> control 진입함");
      //this.layerService.globalSelectedGroup.setMultipleSelectMode(this);
      this.setMultipleSelectMode();
    }
    if(event.modifiers.shift === true){
      console.log("ItemGroup >> onMouseDown >> shift 진입함");
      //this.layerService.globalSelectedGroup.setMultipleSelectMode(this);
      this.setMultipleSelectMode();
    }
    if(event.modifiers.alt === true){

    }
    if( this.checkSelectable() ){
      if (this.isSingleSelectMode()) {
        console.log("ItemGroup >> onMouseDown >> isSingleSelectMode is true");
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
    if(!this.checkSelectable()){
      return;
    }
    this.deactivateSelectedMode();
    this.calcCurrentDistance(event);
    let currentPointerMode = this.layerService.currentPointerMode;
    this.calcCurrentDistance(event);
    if( this.checkSelectable()  ) {
      //this.group.position = event.point;
      this.group.position.x += event.delta.x;
      this.group.position.y += event.delta.y;
    }
  }
  protected onMouseUp(event){
    this.calcCurrentDistance(event);
    if(!this.checkSelectable()){
      return;
    }
    this.resetMyItemAdjustor();

    this.resetDistance();
    this.setSingleSelectMode();
    this.lifeCycleEventEmitter.emit(new ItemLifeCycleEvent(this.id,this,ItemLifeCycleEnum.MODIFY));
  }


  private resetMyItemAdjustor(){
    this.deactivateSelectedMode();
    this.activateSelectedMode();
    this.myItemAdjustor.refreshItemAdjustorSize();
    this.createBackgroundRect();
    this.refreshLinkHandler();
  }
  private refreshLinkHandler(){
    if(this.getNumberOfChild() === 1){
      this.myItemAdjustor.enableLinkHandlers();
    }
    else{
      this.myItemAdjustor.disableLinkHandlers();
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
        this.wbItemGroup[i].isSelected = false;
        drawingLayer.addChild(this.wbItemGroup[i].group);
        this.wbItemGroup.splice(i, 1);
        this.resetMyItemAdjustor();
        return;
      }
    }
  }


  public extractAllFromGroup() {
    let drawingLayer = this.coreItem.parent;
    for (let i = 0; i < this.wbItemGroup.length; i++) {
      //자식을 drawingLayer로 옮겨줌.
      this.wbItemGroup[i].isSelected = false;
      drawingLayer.addChild(this.wbItemGroup[i].group);
    }
    this.wbItemGroup.splice(0, this.wbItemGroup.length);
    this.resetMyItemAdjustor();
  }


  destroyItem() {
    //unGroup하는 작업 실시
    this.coreItem.remove();
    this.lifeCycleEventEmitter.emit(new ItemLifeCycleEvent(this.id, this, ItemLifeCycleEnum.DESTROY));
  }

  destroyItemAndChildren() {
    for (let i = 0; i < this._wbItemGroup.length; i++) {
      this.wbItemGroup[i].destroyItem();
    }
    this.destroyItem();
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

  public refreshItem() {
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
