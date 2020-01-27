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
import {PointerModeManagerService} from '../../Pointer/pointer-mode-manager-service/pointer-mode-manager.service';
import {LinkPort} from '../../Whiteboard-Item/Whiteboard-Shape/LinkPort/link-port';
import {EditableShape} from '../../Whiteboard-Item/Whiteboard-Shape/EditableShape/editable-shape';


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
      this.globalSelectedGroup.extractAllFromSelection();
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
      if(this.isEditingText){
        console.log("DrawingLayerManagerService >> onMouseDown >> isEditingText 진입함");
        this.endEditText();
      }

      if(this.globalSelectedGroup.getNumberOfChild() > 0){
        let hitItem = this.getHittedItem(event.point);
        if(!hitItem){
          if(!this.checkHittedItemIsHandler(event.point)){
            this.globalSelectedGroup.extractAllFromSelection();
          }
        }
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

  public isSelecting(){
    return this.globalSelectedGroup.getNumberOfChild() > 0;
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
  private checkHittedItemIsHandler(point){
    //아직 링크 핸들러만 체크함
    let hitOption = { segments: true, stroke: true, fill: true, tolerance: 5 };
    let hitItem = this.drawingLayer.hitTest(point, hitOption);
    if(hitItem){
      let linkPort:LinkPort = hitItem.item.data.struct;
      if(linkPort instanceof LinkPort){
        return linkPort;
      } else return null;
    } else return null;
  }
  //########################################

  //#########
  private editableShape:EditableShape = null;
  private _isEditingText = false;
  private editTextShape;

  public startEditText() {
    this.isEditingText = true;
    let pointTextItem;
    let editableShape:EditableShape = this.globalSelectedGroup.wbItemGroup[0] as EditableShape;
    if(this.globalSelectedGroup.getNumberOfChild() === 1){
      if(editableShape instanceof EditableShape){
        pointTextItem = editableShape.editText;
        this.globalSelectedGroup.extractAllFromGroup();
      }else{
        return;
      }
    }
    editableShape.isEditing = true;
    let htmlTextEditorWrapper: HTMLElement;
    let htmlTextEditorElement: HTMLElement;
    let htmlCanvasElement: HTMLElement;

    let padding = 5;

    htmlTextEditorWrapper = document.getElementById("textEditorWrapper");
    htmlTextEditorElement = document.getElementById("textEditor");
    htmlCanvasElement = document.getElementById("cv1");

    // 기존 텍스트 제거

    pointTextItem.sendToBack();

    // EditText bound 계산
    let bound = editableShape.coreItem.bounds;

    let htmlEditorPoint = this.posCalcService.advConvertPaperToNg(new Point(editableShape.group.bounds.topLeft.x, editableShape.group.bounds.topLeft.y));

    let edtWidth = this.posCalcService.advConvertLengthPaperToNg(bound.width);
    let edtHeight = this.posCalcService.advConvertLengthPaperToNg(bound.height);

    let textStyle = new TextStyle();

    // EditText HTML Element 스타일 설정
    htmlTextEditorWrapper.style.left = htmlEditorPoint.x + "px";
    htmlTextEditorWrapper.style.top = htmlEditorPoint.y  + "px";
    htmlTextEditorWrapper.style.width = edtWidth - padding * 2 + "px";
    htmlTextEditorWrapper.style.height = edtHeight - padding * 2 + "px";

    htmlTextEditorElement.style.width = edtWidth - padding * 2 + "px";
    htmlTextEditorElement.style.fontFamily = textStyle.fontFamily;
    htmlTextEditorElement.style.fontSize = textStyle.fontSize + "px";
    htmlTextEditorElement.style.fontWeight = textStyle.fontWeight;

    // 숨겨져있던 Editable 영역 표시
    window.setTimeout(() => {
      htmlTextEditorElement.focus();
    }, 0);

    //rawText를 넣으면 태그 문자열이 노출됨 <div>사쿠라</div>세이버  이런식으로 출력됨
    htmlTextEditorElement.innerText = editableShape.textContent;
    this.editTextShape = editableShape;
  }

  //#####################

  public endEditText() {
    console.log("DrawingLayerManagerService >> endEditText >> 진입함");
    let editableShape:EditableShape = this.editTextShape;


    this.isEditingText = false;
    editableShape.isEditing = false;
    let htmlTextEditorWrapper: HTMLElement;
    let htmlTextEditorElement: HTMLElement;
    let htmlCanvasElement: HTMLElement;

    let padding = 5;

    htmlTextEditorWrapper = document.getElementById("textEditorWrapper");
    htmlTextEditorElement = document.getElementById("textEditor");
    htmlCanvasElement = document.getElementById("cv1");




    //에디트 텍스트 값 변경 >>> rawTextContent만 수정하고 refreshItem을 호출하면 알아서 content수정하고 크기조절하고 다 해줌
    editableShape.rawTextContent = htmlTextEditorElement.innerHTML;
    editableShape.refreshItem();

    htmlTextEditorElement.innerText = "";
  }
  //########

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

  get isEditingText(): boolean {
    return this._isEditingText;
  }

  set isEditingText(value: boolean) {
    this._isEditingText = value;
  }

//#####################################
}
