import {EventEmitter, Injectable, Output} from '@angular/core';
import * as paper from 'paper';

import {SimpleStroke} from '../../Whiteboard-Item/editable-stroke/SimpleStroke/simple-stroke';
import {DataType, WhiteboardItemType} from '../../../Helper/data-type-enum/data-type.enum';
import {WhiteboardItem} from '../../Whiteboard-Item/whiteboard-item';
import {HighlightStroke} from '../../Whiteboard-Item/editable-stroke/HighlightStroke/highlight-stroke';
import {EditableRectangle} from '../../Whiteboard-Item/Whiteboard-Shape/EditableShape/EditableRectangle/editable-rectangle';
import {EditableCircle} from '../../Whiteboard-Item/Whiteboard-Shape/EditableShape/EditableCircle/editable-circle';
import {EditableTriangle} from '../../Whiteboard-Item/Whiteboard-Shape/EditableShape/EditableTriangle/editable-triangle';
import {EditableCard} from '../../Whiteboard-Item/Whiteboard-Shape/EditableShape/EditableCard/editable-card';
// @ts-ignore
import Layer = paper.Layer;
// @ts-ignore
import Group = paper.Group;
// @ts-ignore
import PointText = paper.PointText;
// @ts-ignore
import Point = paper.Point;
// @ts-ignore
import Project = paper.Project;

import {TextStyle} from '../../Pointer/shape-service/text-style';
import {PositionCalcService} from '../../PositionCalc/position-calc.service';
import {ItemLifeCycleEnum, ItemLifeCycleEvent} from '../../Whiteboard-Item/WhiteboardItemLifeCycle/WhiteboardItemLifeCycle';
import {SimpleRaster} from '../../Whiteboard-Item/Whiteboard-Shape/editable-raster/SimpleRaster/simple-raster';
import {ZoomControlService} from '../ZoomControl/zoom-control.service';
import {GlobalSelectedGroup} from '../../Whiteboard-Item/ItemGroup/GlobalSelectedGroup/global-selected-group';


@Injectable({
  providedIn: 'root'
})
export class DrawingLayerManagerService {
  private _drawingLayer:Layer;
  private currentProject:Project;

  private _globalSelectedGroup:GlobalSelectedGroup;

  private _whiteboardItemArray:Array<WhiteboardItem>;


  @Output() itemLifeCycleEventEmitter:EventEmitter<any> = new EventEmitter<any>();

  get whiteboardItemArray(): Array<WhiteboardItem> {
    return this._whiteboardItemArray;
  }

  set whiteboardItemArray(value: Array<WhiteboardItem>) {
    this._whiteboardItemArray = value;
  }

  constructor(
    private positionCalcService:PositionCalcService,
    private zoomControlService:ZoomControlService,
  ) {
    this.whiteboardItemArray = new Array<WhiteboardItem>();
    this.itemLifeCycleEventEmitter.subscribe((data:ItemLifeCycleEvent)=>{
      if(!data){
        return;
      }

      switch (data.action) {
        case ItemLifeCycleEnum.CREATE:
          console.log("DrawingLayerManagerService >> itemLifeCycleEventEmitter >> CREATE");
          this.whiteboardItemArray.push(data.item);
          this.drawingLayer.addChild(data.item.group);
          break;
        case ItemLifeCycleEnum.MODIFY:
          console.log("DrawingLayerManagerService >> itemLifeCycleEventEmitter >> MODIFY");
          break;
        case ItemLifeCycleEnum.DESTROY:
          console.log("DrawingLayerManagerService >> itemLifeCycleEventEmitter >> DESTROY");
          let removeIdx = this.indexOfWhiteboardArray(data.id);
          this.whiteboardItemArray.splice(removeIdx, 1);
          break;
      }
    });
  }

  initializeDrawingLayerService(paperProject){
    this.currentProject = paperProject;
    this.currentProject.layers.forEach((value, index, array)=>{
      if(value.data.type === DataType.DRAWING_CANVAS){
        this.drawingLayer = value;
      }
    });
    this.globalSelectedGroup = GlobalSelectedGroup.getInstance(
      this.positionCalcService,this.itemLifeCycleEventEmitter,this.zoomControlService.zoomEventEmitter);
  }

  get drawingLayer(): paper.Layer {
    return this._drawingLayer;
  }

  set drawingLayer(value: paper.Layer) {
    this._drawingLayer = value;
  }

  public indexOfWhiteboardArray(id){
    let children = this.whiteboardItemArray;
    for(let i = 0 ; i < children.length; i++){
      if(children[i].id === id){
        return i
      }
    }
  }

  public addToDrawingLayer(item, type, ...extras){
    let newWhiteboardItem:WhiteboardItem = null;

    //Stroke 형태인 경우
    if(type === WhiteboardItemType.SIMPLE_STROKE
      ||
      type === WhiteboardItemType.HIGHLIGHT_STROKE){
      switch (type) {
        case WhiteboardItemType.SIMPLE_STROKE :
          newWhiteboardItem = new SimpleStroke(item,
            this.positionCalcService,
            this.itemLifeCycleEventEmitter,
            this.zoomControlService.zoomEventEmitter);
          break;
        case WhiteboardItemType.HIGHLIGHT_STROKE :
          newWhiteboardItem = new HighlightStroke(item,
            this.positionCalcService,
            this.itemLifeCycleEventEmitter,
            this.zoomControlService.zoomEventEmitter);
          break;
        default:
          return false;
      }
    }
    else if(type === WhiteboardItemType.SIMPLE_RASTER){
      console.log("DrawingLayerManagerService >> addToDrawingLayer >> 진입함");
      newWhiteboardItem = new SimpleRaster(item,
        this.positionCalcService, this.itemLifeCycleEventEmitter, this.zoomControlService.zoomEventEmitter);
      console.log("DrawingLayerManagerService >> addToDrawingLayer >> newWhiteboardItem : ",newWhiteboardItem);
    }
    else{//Shape 형태인 경우
      let editText:PointText      = extras[0];
      let newTextStyle:TextStyle  = extras[1];
      switch (type) {
        case WhiteboardItemType.EDITABLE_RECTANGLE :
          newWhiteboardItem = new EditableRectangle(
            item, newTextStyle, editText, this.positionCalcService,
            this.itemLifeCycleEventEmitter, this.zoomControlService.zoomEventEmitter);
          break;
        case WhiteboardItemType.EDITABLE_CIRCLE :
          newWhiteboardItem = new EditableCircle(
            item, newTextStyle, editText, this.positionCalcService,
            this.itemLifeCycleEventEmitter, this.zoomControlService.zoomEventEmitter);
          break;
        case WhiteboardItemType.EDITABLE_TRIANGLE :
          newWhiteboardItem = new EditableTriangle(
            item, newTextStyle, editText, this.positionCalcService,
            this.itemLifeCycleEventEmitter, this.zoomControlService.zoomEventEmitter);
          break;
        case WhiteboardItemType.EDITABLE_CARD :
          newWhiteboardItem = new EditableCard(
            item, newTextStyle, editText, this.positionCalcService,
            this.itemLifeCycleEventEmitter, this.zoomControlService.zoomEventEmitter);
          break;
        default:
          return false;
      }
    }
  }
  public getItemById( paperId ){

    //let found = this.findItemById(paperId);
    let found = this.drawingLayer.getItem({id : paperId});
    return found;
  }
  private findItemById(id){
    let children = this.drawingLayer.children;
    for(let i = children.length - 1; i >= 0; i--){
      let value = children[i];
      let found = this.itemFinder_recursion(value, id);
      if(found){
        return found;
      }
    }
    return null;
  }
  private itemFinder_recursion(node, id){
    if(!node){
      return;
    }
    if(node.id === id){
      return node;
    }
    if(node.children){
      for(let i = node.children.length - 1 ; i >= 0; i--){
        let tempNode = this.itemFinder_recursion(node.children[i], id);
        if(tempNode){
          return tempNode;
        }
      }
    }else{
      return null;
    }
  }

  public getWhiteboardItem( item ) : WhiteboardItem{
    let tgt;
    if(item instanceof Group){
      tgt = item
    }else{
      tgt = item.parent;
    }
    return tgt.data.struct;
  }

  public getHittedItem(point) : WhiteboardItem{
    let hitOption = { segments: true, stroke: true, fill: true, tolerance: 5 };
    let children = this.whiteboardItemArray;
    for(let i = children.length - 1 ; i >= 0; i-- ){
      let value = children[i];

      if(value.group.hitTest(point, hitOption)){
        return value;
      }
    }
    //못찾은 경우 null값 리턴
    return null;
  }

  public selectItemOnMultipleMode(wbItem:WhiteboardItem){
    this.globalSelectedGroup.addWbItem(wbItem);
  }
  public deselectAllItemOnMultipleMode(){
    this.globalSelectedGroup.removeAllWbItem();
  }
  public deselectItemOnMultipleMode(wbItem:WhiteboardItem){
    this.globalSelectedGroup.removeWbItem(wbItem);
  }
  public selectItemOnSingleMode(wbItem:WhiteboardItem){
    let numberOfChild = this.globalSelectedGroup.getNumberOfChild();
    if(numberOfChild > 0){
      this.globalSelectedGroup.removeAllWbItem();
    }
    this.globalSelectedGroup.addWbItem(wbItem);
  }
  public deselectItemOnSingleMode(wbItem:WhiteboardItem){
    this.globalSelectedGroup.removeWbItem(wbItem);
  }

  get globalSelectedGroup(): GlobalSelectedGroup {
    return this._globalSelectedGroup;
  }

  set globalSelectedGroup(value: GlobalSelectedGroup) {
    this._globalSelectedGroup = value;
  }
}
