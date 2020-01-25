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
import {PointerModeEvent} from '../../Pointer/PointerModeEvent/pointer-mode-event';
import {PointerMode} from '../../Pointer/pointer-mode-enum-service/pointer-mode-enum.service';
import {SelectModeEnum} from './SelectModeEnum/select-mode-enum.enum';
import {SelectEvent} from './SelectEvent/select-event';
import {SelectEventEnum} from './SelectEventEnum/select-event.enum';
import {InfiniteCanvasService} from '../infinite-canvas.service';
import {ItemGroup} from '../../Whiteboard-Item/ItemGroup/item-group';


@Injectable({
  providedIn: 'root'
})
export class DrawingLayerManagerService {
  private _drawingLayer:Layer;
  private currentProject:Project;

  private _currentPointerMode;


  private _globalSelectedGroup:GlobalSelectedGroup;
  private _whiteboardItemArray:Array<WhiteboardItem>;


  @Output() itemLifeCycleEventEmitter:EventEmitter<any> = new EventEmitter<any>();
  @Output() pointerModeEventEmitter:EventEmitter<any> = new EventEmitter<any>();
  @Output() selectModeEventEmitter:EventEmitter<any> = new EventEmitter<any>();

  constructor(
    private _posCalcService:PositionCalcService,
    private _infiniteCanvasService:InfiniteCanvasService,
  ) {
    this.whiteboardItemArray = new Array<WhiteboardItem>();

    //### 1 화이트보드 아이템 라이프사이클 이벤트
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
    //### 2 포인터 모드 이벤트
    this.pointerModeEventEmitter.subscribe((data:PointerModeEvent)=>{
      console.log("DrawingLayerManagerService >> pointerModeEventEmitter >> data : ",PointerMode[data.currentMode]);
      this.currentPointerMode = data.currentMode;
    });
  }

  initializeDrawingLayerService(paperProject){
    this.currentProject = paperProject;
    this.currentProject.layers.forEach((value, index, array)=>{
      if(value.data.type === DataType.DRAWING_CANVAS){
        this.drawingLayer = value;
      }
    });
    this.globalSelectedGroup = GlobalSelectedGroup.getInstance(this);

    //#### 이걸로 화이트보드 배경 선택시 현재 선택된 그룹을 해제함
    this.currentProject.view.onMouseDown = (event)=>{
      let hitItem = this.getHittedItem(event.point);
      if(!hitItem){
        this.globalSelectedGroup.extractAllFromSelection();
      }
    }
  }

  get drawingLayer(): paper.Layer {
    return this._drawingLayer;
  }

  set drawingLayer(value: paper.Layer) {
    this._drawingLayer = value;
  }

  public addToDrawingLayer(item, type, ...extras){
    let newWhiteboardItem:WhiteboardItem = null;

    //Stroke 형태인 경우
    if(type === WhiteboardItemType.SIMPLE_STROKE
      ||
      type === WhiteboardItemType.HIGHLIGHT_STROKE){
      switch (type) {
        case WhiteboardItemType.SIMPLE_STROKE :
          newWhiteboardItem = new SimpleStroke(item, this);
          break;
        case WhiteboardItemType.HIGHLIGHT_STROKE :
          newWhiteboardItem = new HighlightStroke(item,this);
          break;
        default:
          return false;
      }
    }
    else if(type === WhiteboardItemType.SIMPLE_RASTER){
      console.log("DrawingLayerManagerService >> addToDrawingLayer >> 진입함");
      newWhiteboardItem = new SimpleRaster(item,this);
      console.log("DrawingLayerManagerService >> addToDrawingLayer >> newWhiteboardItem : ",newWhiteboardItem);
    }
    else{//Shape 형태인 경우
      let editText:PointText      = extras[0];
      let newTextStyle:TextStyle  = extras[1];
      switch (type) {
        case WhiteboardItemType.EDITABLE_RECTANGLE :
          newWhiteboardItem = new EditableRectangle(
            item, newTextStyle, editText, this);
          break;
        case WhiteboardItemType.EDITABLE_CIRCLE :
          newWhiteboardItem = new EditableCircle(
            item, newTextStyle, editText, this);
          break;
        case WhiteboardItemType.EDITABLE_TRIANGLE :
          newWhiteboardItem = new EditableTriangle(
            item, newTextStyle, editText, this);
          break;
        case WhiteboardItemType.EDITABLE_CARD :
          newWhiteboardItem = new EditableCard(
            item, newTextStyle, editText, this);
          break;
        default:
          return false;
      }
    }
  }


  //##### 화이트보드 아이템을 찾는 메서드 #######
  public getItemById( paperId ){
    //let found = this.findItemById(paperId);
    let found = this.drawingLayer.getItem({id : paperId});
    return found;
  }
  public indexOfWhiteboardArray(id){
    let children = this.whiteboardItemArray;
    for(let i = 0 ; i < children.length; i++){
      if(children[i].id === id){
        return i
      }
    }
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
      //그룹의 선택영역일 수 도 있으므로, 그룹 영역검사
      if(value instanceof ItemGroup){
        if(value.backgroundRect.contains(point)){
          return value;
        }
      }
    }
    //못찾은 경우 null값 리턴

    return null;
  }
  //########################################

  //########## Getter & Setter ##########

  get whiteboardItemArray(): Array<WhiteboardItem> {
    return this._whiteboardItemArray;
  }

  set whiteboardItemArray(value: Array<WhiteboardItem>) {
    this._whiteboardItemArray = value;
  }
  get globalSelectedGroup(): GlobalSelectedGroup {
    return this._globalSelectedGroup;
  }

  set globalSelectedGroup(value: GlobalSelectedGroup) {
    this._globalSelectedGroup = value;
  }

  get posCalcService(): PositionCalcService {
    return this._posCalcService;
  }

  set posCalcService(value: PositionCalcService) {
    this._posCalcService = value;
  }

  get currentPointerMode() {
    return this._currentPointerMode;
  }

  set currentPointerMode(value) {
    this._currentPointerMode = value;
  }

  get infiniteCanvasService(): InfiniteCanvasService {
    return this._infiniteCanvasService;
  }

  set infiniteCanvasService(value: InfiniteCanvasService) {
    this._infiniteCanvasService = value;
  }

//#####################################
}
