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
import {
  ItemLifeCycleEnum,
  ItemLifeCycleEvent,
  LinkItemLifeCycleEvent
} from '../../Whiteboard-Item/WhiteboardItemLifeCycle/WhiteboardItemLifeCycle';
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
import {ContextMenuService} from "../../ContextMenu/context-menu-service/context-menu.service";
import {EditableLink} from '../../Whiteboard-Item/Whiteboard-Shape/LinkPort/EditableLink/editable-link';
import {LinkerModeChangeEvent} from './LinkModeManagerService/LinkerModeChangeEvent/linker-mode-change-event';
import {LinkerMode} from './LinkModeManagerService/LinkMode/linker-mode';
import {EditableItemGroup} from '../../Whiteboard-Item/ItemGroup/EditableItemGroup/editable-item-group';
import {HorizonContextMenuService} from "../../ContextMenu/horizon-context-menu-service/horizon-context-menu.service";
import {WorkHistoryManager} from './WorkHistoryManager/work-history-manager';
import {CursorChangeService} from "../../Pointer/cursor-change-service/cursor-change.service";


@Injectable({
  providedIn: 'root'
})
export class DrawingLayerManagerService {
  private _drawingLayer:Layer;
  private currentProject:Project;
  private _contextMenu: ContextMenuService;

  private _currentLinkerMode:LinkerMode;

  private _currentPointerMode;
  private longTouchTimer;
  private fromPoint: Point;

  private _globalSelectedGroup:GlobalSelectedGroup;
  private _whiteboardItemArray:Array<WhiteboardItem>;
  private _editableLinkArray:Array<EditableLink>;

  private _isEditableLinkSelected:Boolean;

  private _idGenerator = 0;
  private _linkIdGenerator = 0;


  @Output() wbItemLifeCycleEventEmitter:EventEmitter<any> = new EventEmitter<any>();
  @Output() pointerModeEventEmitter:EventEmitter<any> = new EventEmitter<any>();
  @Output() selectModeEventEmitter:EventEmitter<any> = new EventEmitter<any>();
  @Output() linkModeEventEmitter:EventEmitter<any> = new EventEmitter<any>();

  constructor(
    private _posCalcService:PositionCalcService,
    private _infiniteCanvasService:InfiniteCanvasService,
    private _horizonContextMenuService: HorizonContextMenuService,
    private _cursorChangeService: CursorChangeService,
  ) {
    this._whiteboardItemArray = new Array<WhiteboardItem>();
    this._editableLinkArray = new Array<EditableLink>();

    //### 1 화이트보드 아이템 라이프사이클 이벤트
    this.initLifeCycleHandler();
    //### 2 포인터 모드 이벤트
    this.initPointerHandler();
    //### 3 링커 모드 이벤트
    this.initLinkModeHandler();
  }

  initializeDrawingLayerService(paperProject, contextMenuService: ContextMenuService){
    this.currentProject = paperProject;
    this._contextMenu = contextMenuService;
    this.currentProject.layers.forEach((value, index, array)=>{
      if(value.data.type === DataType.DRAWING_CANVAS){
        this.drawingLayer = value;
      }
    });
    this.globalSelectedGroup = GlobalSelectedGroup.getInstance(this.getWbId(), this);

    // horizon Context Menu 초기화
    this.horizonContextMenuService.initializeHorizonContextMenuService(this.globalSelectedGroup);

    //#### 이걸로 화이트보드 배경 선택시 현재 선택된 그룹을 해제함
    this.currentProject.view.onMouseDown = (event)=>{
      if(this.isEditingText){
        console.log("DrawingLayerManagerService >> onMouseDown >> isEditingText 진입함");
        this.endEditText();
        this.horizonContextMenuService.close();
        return;
      }
      if(this.globalSelectedGroup.getNumberOfChild() > 0){
        let hitItem = this.getHittedItem(event.point);
        if(!hitItem){
          if(!this.checkHittedItemIsHandler(event.point)){
            this.globalSelectedGroup.extractAllFromSelection();
            return;
          }
        }
      }else{
        return;
      }

      // let point = this.initPoint(event.event);
      // this.initFromPoint(point);
      // if(event.event instanceof TouchEvent) {
      //   this.longTouchTimer = setTimeout(this.onLongTouch, 500, event.event, this.contextMenu);
      // }
    };
    // this.currentProject.view.onMouseDrag = (event) => {
    //   // TODO : Canvas Mover 에서 드래그 이벤트 발생 안함
    //   if(event.event instanceof TouchEvent) {
    //     if(this.calcTolerance(this.initPoint(event.event))){
    //       clearTimeout(this.longTouchTimer);
    //     }
    //   }
    // };
    // this.currentProject.view.onMouseUp = (event) => {
    //   if(event.event instanceof TouchEvent) {
    //     clearTimeout(this.longTouchTimer);
    //   }
    // };
  }

  public addWbLink(editableLink:EditableLink){
    console.log("DrawingLayerManagerService >> addWbLink >> 진입함 : ",editableLink.id);
    this.editableLinkArray.push(editableLink);
  }
  public deleteWbLink(editableLink:EditableLink){
    console.log("DrawingLayerManagerService >> deleteWbLink >> 진입함 : ",editableLink.id);
    let deleteIdx = this.editableLinkArray.indexOf(editableLink);
    if(deleteIdx > -1){
      this.editableLinkArray.splice(deleteIdx, 1);
    }
  }

  private initPointerHandler(){
    this.pointerModeEventEmitter.subscribe((data:PointerModeEvent)=>{
      console.log("DrawingLayerManagerService >> pointerModeEventEmitter >> data : ",PointerMode[data.currentMode]);
      this.currentPointerMode = data.currentMode;
      if(this.globalSelectedGroup){
        this.globalSelectedGroup.extractAllFromSelection();
      }
    });

  }
  private initLifeCycleHandler(){
    WorkHistoryManager.initInstance(this.wbItemLifeCycleEventEmitter);
    this.wbItemLifeCycleEventEmitter.subscribe((data:ItemLifeCycleEvent)=>{
      if(!data){
        return;
      }
      switch (data.action) {
        case ItemLifeCycleEnum.CREATE:
          console.log("DrawingLayerManagerService >> wbItemLifeCycleEventEmitter >> CREATE");
          this.whiteboardItemArray.push(data.item);
          if( !(data.item instanceof EditableItemGroup) ){
            this.drawingLayer.addChild(data.item.group);
          }
          break;
        case ItemLifeCycleEnum.MODIFY:
          console.log("DrawingLayerManagerService >> wbItemLifeCycleEventEmitter >> MODIFY : ",data.item);
          break;
        case ItemLifeCycleEnum.DESTROY:
          console.log("DrawingLayerManagerService >> wbItemLifeCycleEventEmitter >> DESTROY");
          let removeIdx = this.indexOfWhiteboardArray(data.id);
          this.whiteboardItemArray.splice(removeIdx, 1);
          break;
      }
    });
  }

  private initLinkModeHandler(){
    this.linkModeEventEmitter.subscribe((data:LinkerModeChangeEvent)=>{
      console.log("DrawingLayerManagerService >> linkModeEventEmitter >> data : ",data);
      this.currentLinkerMode = data.currentLinkerMode;
    });
  }


  private calcTolerance(point: Point) {
    return this.fromPoint.getDistance(point) > 10;
  }

  private initFromPoint(point: Point) {
    this.fromPoint = point;
  }
  private initPoint(event: MouseEvent | TouchEvent): Point {
    let point: Point;
    if(event instanceof MouseEvent) {
      point = new Point(event.clientX, event.clientY);
    } else {
      point = new Point(event.touches[0].clientX, event.touches[0].clientY);
    }
    return point;
  }

  get drawingLayer(): paper.Layer {
    return this._drawingLayer;
  }

  set drawingLayer(value: paper.Layer) {
    this._drawingLayer = value;
  }

  private static isEditableStroke(type){
    return type === WhiteboardItemType.SIMPLE_STROKE || type === WhiteboardItemType.HIGHLIGHT_STROKE;
  }
  private static isEditableShape(type){
    return type === WhiteboardItemType.EDITABLE_TRIANGLE
      || type === WhiteboardItemType.EDITABLE_RECTANGLE
      || type === WhiteboardItemType.EDITABLE_CIRCLE
      || type === WhiteboardItemType.EDITABLE_CARD;
  }
  private static isEditableRaster(type){
    return type === WhiteboardItemType.SIMPLE_RASTER;
  }
  private static isEditableGroup(type){
    return type === WhiteboardItemType.EDITABLE_GROUP;
  }
  private static isEditableLink(type){
    return type === WhiteboardItemType.SIMPLE_ARROW_LINK
      || type === WhiteboardItemType.SIMPLE_LINE_LINK
  }

  public addToDrawingLayer(item, type, ...extras){
    let newWhiteboardItem:WhiteboardItem = null;

    //Stroke 형태인 경우
    if(DrawingLayerManagerService.isEditableStroke(type)){
      switch (type) {
        case WhiteboardItemType.SIMPLE_STROKE :
          newWhiteboardItem = new SimpleStroke(this.getWbId(), item, this);
          break;
        case WhiteboardItemType.HIGHLIGHT_STROKE :
          newWhiteboardItem = new HighlightStroke(this.getWbId(), item,this);
          break;
        default:
          return false;
      }
    }
    else if(DrawingLayerManagerService.isEditableRaster(type)){
      newWhiteboardItem = new SimpleRaster(this.getWbId(), item, this);
    }
    else if(DrawingLayerManagerService.isEditableShape(type)){
      let editText:PointText      = extras[0];
      let newTextStyle:TextStyle  = extras[1];
      switch (type) {
        case WhiteboardItemType.EDITABLE_RECTANGLE :
          newWhiteboardItem = new EditableRectangle(
            this.getWbId(),
            item, newTextStyle, editText, this);
          break;
        case WhiteboardItemType.EDITABLE_CIRCLE :
          newWhiteboardItem = new EditableCircle(
            this.getWbId(),
            item, newTextStyle, editText, this);
          break;
        case WhiteboardItemType.EDITABLE_TRIANGLE :
          newWhiteboardItem = new EditableTriangle(
            this.getWbId(),
            item, newTextStyle, editText, this);
          break;
        case WhiteboardItemType.EDITABLE_CARD :
          newWhiteboardItem = new EditableCard(
            this.getWbId(),
            item, newTextStyle, editText, this);
          break;
        default:
          return false;
      }
    }
    else if(DrawingLayerManagerService.isEditableGroup(type)){
      newWhiteboardItem = new EditableItemGroup(this.getWbId(),this);
    }
    return newWhiteboardItem
  }
  public isSelecting(){
    return this.globalSelectedGroup.getNumberOfChild() > 0;
  }


  //##### 화이트보드 아이템을 찾는 메서드 #######
  public getItemById( targetId ){
    //let found = this.findItemById(paperId);
    let found = null;
    let children = this.whiteboardItemArray;

    for(let i = 0 ; i < children.length; i++){
      let currItem = children[i];
      if(currItem.id === targetId ){
        return currItem;
      }
    }
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
    let hitOption = { segments: true, stroke: true, fill: true, tolerance: 15 };
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

    // EditText HTML Element 스타일 설정
    this.setWrapperStyle(htmlTextEditorWrapper, htmlEditorPoint, edtWidth, edtHeight, padding);

    this.setEditorStyle(htmlTextEditorElement, edtWidth, padding, editableShape.textStyle);

    // 숨겨져있던 Editable 영역 표시
    window.setTimeout(() => {
      htmlTextEditorElement.focus();
    }, 0);

    //rawText를 넣으면 태그 문자열이 노출됨 <div>사쿠라</div>세이버  이런식으로 출력됨
    htmlTextEditorElement.innerText = editableShape.textContent;
    this.editTextShape = editableShape;
  }

  private setWrapperStyle(element, point, width, height, padding) {
    element.style.left = point.x + "px";
    element.style.top = point.y  + "px";
    element.style.width = width - padding * 2 + "px";
    element.style.height = height - padding * 2 + "px";
  }

  private setEditorStyle(element, width, padding, style) {
    element.style.width = width - padding * 2 + "px";
    element.style.color = style.fontColor;
    element.style.fontFamily = style.fontFamily;
    element.style.fontSize = style.fontSize + "px";
    element.style.fontWeight = style.isBold ? "bold" : "normal";
    element.style.fontStyle = style.isItalic ? "italic" : "";
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

  public groupSelectedItems(){
    let gsg = this.globalSelectedGroup;
    for (let i = 0; i < gsg.wbItemGroup.length; i++) {
      let currWbItem = gsg.wbItemGroup[i];
      if(currWbItem.isGrouped && currWbItem.parentEdtGroup){
        currWbItem.parentEdtGroup.destroyItem();
      }
    }

    let newEdtGroup:EditableItemGroup = this.addToDrawingLayer(null, WhiteboardItemType.EDITABLE_GROUP) as EditableItemGroup;

    this.globalSelectedGroup.wbItemGroup.forEach((value, index, array)=>{
      newEdtGroup.addItem(value);
    });

    this.globalSelectedGroup.extractAllFromSelection();
  }

  public ungroupSelectedItems(){
    let gsg = this.globalSelectedGroup;
    for (let i = 0; i < gsg.wbItemGroup.length; i++) {
      let currWbItem = gsg.wbItemGroup[i];
      if(currWbItem.isGrouped && currWbItem.parentEdtGroup){
        currWbItem.parentEdtGroup.destroyItem();
      }
    }
    this.globalSelectedGroup.extractAllFromSelection();
  }

  // #################### on Event Method #####################

  private onLongTouch(event: TouchEvent, contextMenu: ContextMenuService) {
    contextMenu.openMenu(event);
  }

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

  get contextMenu(): ContextMenuService {
    return this._contextMenu;
  }

  get linkIdGenerator(): number {
    return this._linkIdGenerator++;
  }


  get currentLinkerMode(): LinkerMode {
    return this._currentLinkerMode;
  }

  set currentLinkerMode(value: LinkerMode) {
    this._currentLinkerMode = value;
  }

  public getWbId(){
    return this._idGenerator++;
  }


  get editableLinkArray(): Array<EditableLink> {
    return this._editableLinkArray;
  }

  set editableLinkArray(value: Array<EditableLink>) {
    this._editableLinkArray = value;
  }


  get isEditableLinkSelected(): Boolean {
    return this._isEditableLinkSelected;
  }

  set isEditableLinkSelected(value: Boolean) {
    this._isEditableLinkSelected = value;
  }
  get horizonContextMenuService(): HorizonContextMenuService {
    return this._horizonContextMenuService;
  }

  get cursorChanger(): CursorChangeService {
    return this._cursorChangeService;
  }

//#####################################
}
