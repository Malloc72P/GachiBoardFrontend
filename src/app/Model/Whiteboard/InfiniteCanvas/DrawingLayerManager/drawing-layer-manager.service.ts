import {EventEmitter, Injectable, Output} from '@angular/core';
import * as paper from 'paper';

import {SimpleStroke} from '../../Whiteboard-Item/editable-stroke/SimpleStroke/simple-stroke';
import {WhiteboardItemType} from '../../../Helper/data-type-enum/data-type.enum';
import {WhiteboardItem} from '../../Whiteboard-Item/whiteboard-item';
import {HighlightStroke} from '../../Whiteboard-Item/editable-stroke/HighlightStroke/highlight-stroke';
import {EditableRectangle} from '../../Whiteboard-Item/editable-shape/EditableRectangle/editable-rectangle';
import {EditableCircle} from '../../Whiteboard-Item/editable-shape/EditableCircle/editable-circle';
import {EditableTriangle} from '../../Whiteboard-Item/editable-shape/EditableTriangle/editable-triangle';
import {EditableCard} from '../../Whiteboard-Item/editable-shape/EditableCard/editable-card';
import {EditableRaster} from '../../Whiteboard-Item/editable-shape/EditableRaster/editable-raster';
import {EditableShape} from '../../Whiteboard-Item/editable-shape/editable-shape';
// @ts-ignore
import Layer = paper.Layer;
// @ts-ignore
import Group = paper.Group;
// @ts-ignore
import PointText = paper.PointText;
// @ts-ignore
import Point = paper.Point;
import {TextStyle} from '../../Pointer/shape-service/text-style';
import {PositionCalcService} from '../../PositionCalc/position-calc.service';
import {ItemLifeCycleEnum, ItemLifeCycleEvent} from '../../Whiteboard-Item/WhiteboardItemLifeCycle/WhiteboardItemLifeCycle';


@Injectable({
  providedIn: 'root'
})
export class DrawingLayerManagerService {
  private _drawingLayer:Layer;

  private _whiteboardItemArray:Array<WhiteboardItem>;
  @Output() itemLifeCycleEventEmitter:EventEmitter<any> = new EventEmitter<any>();

  get whiteboardItemArray(): Array<WhiteboardItem> {
    return this._whiteboardItemArray;
  }

  set whiteboardItemArray(value: Array<WhiteboardItem>) {
    this._whiteboardItemArray = value;
  }

  constructor(
    private positionCalcService:PositionCalcService
  ) {
    this.whiteboardItemArray = new Array<WhiteboardItem>();
    this.itemLifeCycleEventEmitter.subscribe((data:ItemLifeCycleEvent)=>{
      if(!data){
        return;
      }

      switch (data.action) {
        case ItemLifeCycleEnum.CREATE:
          console.log("DrawingLayerManagerService >> itemLifeCycleEventEmitter >> CREATE");
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
    })
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
    let newGroup = new Group();
    newGroup.applyMatrix = false;
    let newWhiteboardItem:WhiteboardItem = null;
    item.data.myGroup = newGroup;

    //Stroke 형태인 경우
    if(WhiteboardItemType.SIMPLE_STROKE === type
      ||
      WhiteboardItemType.HIGHLIGHT_STROKE === type){
      switch (type) {
        case WhiteboardItemType.SIMPLE_STROKE :
          newWhiteboardItem = new SimpleStroke(newGroup, type, item, this.itemLifeCycleEventEmitter);
          break;
        case WhiteboardItemType.HIGHLIGHT_STROKE :
          newWhiteboardItem = new HighlightStroke(newGroup, type, item, this.itemLifeCycleEventEmitter);
          break;
        default:
          return false;
      }
    }
    else{//Shape 형태인 경우
      let editText:PointText      = extras[0];
      let newTextStyle:TextStyle  = extras[1];
      switch (type) {
        case WhiteboardItemType.EDITABLE_RECTANGLE :
          newWhiteboardItem = new EditableRectangle(newGroup,
            type, item, newTextStyle, editText, this.positionCalcService, this.itemLifeCycleEventEmitter);
          break;
        case WhiteboardItemType.EDITABLE_CIRCLE :
          newWhiteboardItem = new EditableCircle(newGroup,
            type, item, newTextStyle, editText, this.positionCalcService, this.itemLifeCycleEventEmitter);
          break;
        case WhiteboardItemType.EDITABLE_TRIANGLE :
          newWhiteboardItem = new EditableTriangle(newGroup,
            type, item, newTextStyle, editText, this.positionCalcService, this.itemLifeCycleEventEmitter);
          break;
        case WhiteboardItemType.EDITABLE_CARD :
          newWhiteboardItem = new EditableCard(newGroup,
            type, item, newTextStyle, editText, this.positionCalcService, this.itemLifeCycleEventEmitter);
          break;
        case WhiteboardItemType.EDITABLE_RASTER :
          newWhiteboardItem = new EditableRaster(newGroup,
            type, item, newTextStyle, editText, this.positionCalcService, this.itemLifeCycleEventEmitter);
          break;
        default:
          return false;
      }

      newGroup.addChild(editText);
    }



    this.whiteboardItemArray.push(newWhiteboardItem);

    newGroup.data.struct = newWhiteboardItem;
    newGroup.addChild(item);
    let originScale:Point = newWhiteboardItem.group.scaling;


    this.drawingLayer.addChild(newGroup);
    newWhiteboardItem.notifyItemCreation();
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

}
