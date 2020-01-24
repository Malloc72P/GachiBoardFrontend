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
import Rectangle = paper.Rectangle;
import {ItemLifeCycleEnum, ItemLifeCycleEvent} from '../WhiteboardItemLifeCycle/WhiteboardItemLifeCycle';

export class ItemGroup extends WhiteboardItem{
  private _wbItemGroup:Array<WhiteboardItem>;
  constructor(type, item:Item,
                        posCalcService:PositionCalcService,
                        eventEmitter:EventEmitter<any>,
                        zoomEventEmitter:EventEmitter<any>) {
    super(type, item, posCalcService, eventEmitter, zoomEventEmitter);
    this.coreItem = this.group;
    this.wbItemGroup = new Array<WhiteboardItem>();
    console.log("ItemGroup >> constructor >> 진입함");
    let prevNumberOfChildren = this.coreItem.children.length;
    this.coreItem.onFrame = (event)=>{
      if(this.isSelected){
        let currNumberOfChildren = this.coreItem.children.length;
        if(prevNumberOfChildren !== currNumberOfChildren){
          this.deactivateSelectedMode();
          this.activateSelectedMode();
        }
        prevNumberOfChildren = this.coreItem.children.length;
      }
    }
  }
  public addWbItem(wbItem:WhiteboardItem) {
    this.wbItemGroup.push(wbItem);
    this.coreItem.addChild(wbItem.group);
    this.activateSelectedMode();
  }
  public removeWbItem(wbItem:WhiteboardItem) {
    for(let i = 0 ; i < this.wbItemGroup.length; i++){
      if(this.wbItemGroup[i].id === wbItem.id){
        let drawingLayer = this.coreItem.parent;
        //자식을 drawingLayer로 옮겨줌.
        drawingLayer.addChild(this.wbItemGroup[i].group);
        this.deactivateSelectedMode();
        this.wbItemGroup.splice(i, 1);
        return;
      }
    }
  }
  public removeAllWbItem() {
    let drawingLayer = this.coreItem.parent;
    for(let i = 0 ; i < this.wbItemGroup.length; i++){
      //자식을 drawingLayer로 옮겨줌.
      drawingLayer.addChild(this.wbItemGroup[i].group);
      this.deactivateSelectedMode();
    }
    this.wbItemGroup.splice(0, this.wbItemGroup.length);
  }


  destroyItem() {
    //unGroup하는 작업 실시
    this.coreItem.remove();
    this.lifeCycleEventEmitter.emit(new ItemLifeCycleEvent(this.id, this, ItemLifeCycleEnum.DESTROY));
  }
  destroyItemAndChildren() {
    for(let i = 0 ; i < this._wbItemGroup.length; i++){
      this.wbItemGroup[i].destroyItem();
    }
    this.destroyItem();
  }

  public getNumberOfChild() {
    return this.coreItem.children.length;
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
}
