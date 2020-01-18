import {Injectable} from '@angular/core';
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

@Injectable({
  providedIn: 'root'
})
export class DrawingLayerManagerService {
  private _drawingLayer:Layer;

  private _whiteboardItemArray:Array<WhiteboardItem>;

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
  }

  get drawingLayer(): paper.Layer {
    return this._drawingLayer;
  }

  set drawingLayer(value: paper.Layer) {
    this._drawingLayer = value;
  }

  public addToDrawingLayer(item, type, ...extras){
    console.log("DrawingLayerManagerService >> addToDrawingLayer >> 진입함");
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
          newWhiteboardItem = new SimpleStroke(newGroup, type, item);
          break;
        case WhiteboardItemType.HIGHLIGHT_STROKE :
          newWhiteboardItem = new HighlightStroke(newGroup, type, item);
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
            type, item, newTextStyle, editText, this.positionCalcService);
          break;
        case WhiteboardItemType.EDITABLE_CIRCLE :
          newWhiteboardItem = new EditableCircle(newGroup,
            type, item, newTextStyle, editText, this.positionCalcService);
          break;
        case WhiteboardItemType.EDITABLE_TRIANGLE :
          newWhiteboardItem = new EditableTriangle(newGroup,
            type, item, newTextStyle, editText, this.positionCalcService);
          break;
        case WhiteboardItemType.EDITABLE_CARD :
          newWhiteboardItem = new EditableCard(newGroup,
            type, item, newTextStyle, editText, this.positionCalcService);
          break;
        case WhiteboardItemType.EDITABLE_RASTER :
          newWhiteboardItem = new EditableRaster(newGroup,
            type, item, newTextStyle, editText, this.positionCalcService);
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


    item.onFrame = (event)=>{
      if(event.count % 15 === 0){
        newWhiteboardItem.topLeft = item.bounds.topLeft;
        if(newWhiteboardItem instanceof EditableShape){

          let editText = newWhiteboardItem.editText;
          editText.position = new Point(newWhiteboardItem.coreItem.bounds.center);
          if(!newWhiteboardItem.isEditing){
            editText.bringToFront();
          }
      }

      }
    };

    this.drawingLayer.addChild(newGroup);
  }
  public getItemById( paperId ){

    //let found = this.findItemById(paperId);
    let found = this.drawingLayer.getItem({id : paperId});
    console.log("DrawingLayerManagerService >> getItemById >> found : ",found);
    return found;
  }
  private findItemById(id){
    console.log("\n\nDrawingLayerManagerService >> findItemById >> 진입함");
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
      console.log("DrawingLayerManagerService >> recursiveItemFinder >> node : ",node);
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

  public getHittedItem(point){
    let children = this.drawingLayer.children;
    for(let i = children.length - 1 ; i >= 0; i-- ){
      let value = children[i];

      if(!(value instanceof Group)){
        //그룹이 아닌게
        value = value.data.myGroup;
      }

      if(value && value.hitTest(point)){
        return value;
      }
    }
    console.warn("DrawingLayerManagerService >> getHittedItem >> 못찾음 : ",point);
  }

}
