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

// @ts-ignore
import Rectangle = paper.Rectangle;

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
import value from "*.json";
import {SizeHandler} from "../../Whiteboard-Item/ItemAdjustor/ItemHandler/SizeHandler/size-handler";
import {ItemHandler} from "../../Whiteboard-Item/ItemAdjustor/ItemHandler/item-handler";
import {WhiteboardShape} from "../../Whiteboard-Item/Whiteboard-Shape/whiteboard-shape";
import {LinkHandlerPositions} from "../../Whiteboard-Item/Whiteboard-Shape/LinkPort/EditableLink/link-handler-positions";
import {LinkHandler} from "../../Whiteboard-Item/Whiteboard-Shape/LinkPort/EditableLink/LinkHandler/link-handler";
import {WsWhiteboardController} from '../../../../Controller/Controller-WebSocket/websocket-manager/WhiteboardWsController/ws-whiteboard.controller';
import Global = WebAssembly.Global;
import {WbItemEventManagerService} from '../../../../Controller/Controller-WebSocket/websocket-manager/WhiteboardWsController/wb-item-event-manager.service';
import {
  WbItemEvent,
  WbItemEventEnum
} from '../../../../Controller/Controller-WebSocket/websocket-manager/WhiteboardWsController/wb-item-event/wb-item-event';
import {WhiteboardItemFactory} from '../WhiteboardItemFactory/whiteboard-item-factory';
import {WbItemFactoryResult} from '../WhiteboardItemFactory/WbItemFactoryResult/wb-item-factory-result';


@Injectable({
  providedIn: 'root'
})
export class DrawingLayerManagerService {
  private _drawingLayer:Layer;
  private _currentProject:Project;
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

  private hitOption = { segments: true, stroke: true, fill: true, tolerance: 15 };

  @Output() wbItemLifeCycleEventEmitter:EventEmitter<any> = new EventEmitter<any>();
  @Output() pointerModeEventEmitter:EventEmitter<any> = new EventEmitter<any>();
  @Output() selectModeEventEmitter:EventEmitter<any> = new EventEmitter<any>();
  @Output() linkModeEventEmitter:EventEmitter<any> = new EventEmitter<any>();

  constructor(
    private _posCalcService:PositionCalcService,
    private _infiniteCanvasService:InfiniteCanvasService,
    private _horizonContextMenuService: HorizonContextMenuService,
    private _cursorChangeService: CursorChangeService,
    private wbItemEventManagerService: WbItemEventManagerService,
  ) {
    this._whiteboardItemArray = new Array<WhiteboardItem>();
    this._editableLinkArray = new Array<EditableLink>();

    //### 1 화이트보드 아이템 라이프사이클 이벤트
    this.initLifeCycleHandler();
    this.initWbItemWsEventHandler();
    //### 2 포인터 모드 이벤트
    this.initPointerHandler();
    //### 3 링커 모드 이벤트
    this.initLinkModeHandler();
  }

  initializeDrawingLayerService(paperProject, contextMenuService: ContextMenuService){
    this._currentProject = paperProject;
    this._contextMenu = contextMenuService;
    this._currentProject.layers.forEach((value, index, array)=>{
      if(value.data.type === DataType.DRAWING_CANVAS){
        this.drawingLayer = value;
      }
    });
    this.globalSelectedGroup = GlobalSelectedGroup.getInstance(this.getWbId(), this);

    // horizon Context Menu 초기화
    this.horizonContextMenuService.initializeHorizonContextMenuService(this.globalSelectedGroup);
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
  /* *************************************************** */
  /* Whiteboard Item Lifecycle Handler START */
  /* *************************************************** */

  private initWbItemWsEventHandler(){
    this.wbItemEventManagerService.wsWbItemEventEmitter
      .subscribe((recvWbItemEvent:WbItemEvent)=>{
      if(!recvWbItemEvent){
        return;
      }
      console.log("DrawingLayerManagerService >> initWbItemWsEventHandler >> recvWbItemEvent : ",recvWbItemEvent);
      switch (recvWbItemEvent.action) {
        case WbItemEventEnum.CREATE:
          WhiteboardItemFactory.buildWbItems(recvWbItemEvent.data)
            .subscribe((res:WbItemFactoryResult)=>{
              console.log("DrawingLayerManagerService >> initWbItemWsEventHandler >> res : ",res);
            });
          break;
        case WbItemEventEnum.DELETE:
          break;
        case WbItemEventEnum.UPDATE:
          break;
        case WbItemEventEnum.READ:
          break;
        case WbItemEventEnum.LOCK:
          break;
        case WbItemEventEnum.UNLOCK:
          break;
      }
    });
  }


  private initLifeCycleHandler(){
    WorkHistoryManager.initInstance(this.wbItemLifeCycleEventEmitter);
    this.wbItemLifeCycleEventEmitter.subscribe((data:ItemLifeCycleEvent)=>{
      if(!data){
        return;
      }
      if( (data.item instanceof EditableItemGroup) || (data.item instanceof GlobalSelectedGroup) ){
        return;
      }
      let wsWbController = WsWhiteboardController.getInstance();
      switch (data.action) {
        case ItemLifeCycleEnum.CREATE:
          this.whiteboardItemArray.push(data.item);
          this.drawingLayer.addChild(data.item.group);

          if(data.item.id === -1){
            wsWbController.waitRequestCreateWbItem(data.item.exportToDto())
              .subscribe((packetDto)=>{
                console.log("DrawingLayerManagerService >> addToDrawingLayer >> packetDto : ",packetDto);
                data.item.id = packetDto.dataDto.id;
                console.log("DrawingLayerManagerService >> addToDrawingLayer >> CREATE >> newWhiteboardItem : ",data.item);
              });
          }
          break;
        case ItemLifeCycleEnum.MODIFY:
          break;
        case ItemLifeCycleEnum.DESTROY:
          break;
      }
    });
  }
  /* **************************************************** */
  /* Whiteboard Item Lifecycle Handler END */
  /* **************************************************** */

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
    return type === WhiteboardItemType.EDITABLE_LINK;
  }

  public addToDrawingLayer(item, type, ...extras){
    let newWhiteboardItem: WhiteboardItem = null;

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
    } else if(DrawingLayerManagerService.isEditableLink(type)) {
      // extras[0] : linkHeadType, extras[1] : linkTailType
      // extras[2] : toLinkPort, extras[2] : fromLinkPort
      newWhiteboardItem = new EditableLink(this.getWbId(), item, extras[0], extras[1], this, extras[2], extras[3]);
    }

    return newWhiteboardItem;
  }

  get isSelecting(): boolean {
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

  public getHittedItemHandler(point): ItemHandler {
    return this.findInItemHandlers(point);
  }

  public getHittedLinkPort(point): LinkPort {
    return this.findInLinkPorts(point);
  }

  public getHittedItem(point, tolerance?: number, excludeEditableLink?: boolean): WhiteboardItem {
    return this.findInWhiteboardItems(point, tolerance, excludeEditableLink);
  }

  public getHittedLinkHandler(point): LinkHandler {
    return this.findInLinkHandlers(point);
  }

  private findInItemHandlers(point): ItemHandler {
    if(this.isSelecting) {
      if(!this.globalSelectedGroup.myItemAdjustor) {
        return null;
      }
      let handles = this.globalSelectedGroup.myItemAdjustor.sizeHandlers;
      for(let [key, handle] of handles) {
        if(handle.handlerCircleObject.hitTest(point, this.hitOption)) {
          return handle;
        }
      }
    } else {
      return null;
    }
  }

  private findInLinkHandlers(point): LinkHandler {
    if(this.isSelecting) {
      if(this.globalSelectedGroup.wbItemGroup[0] instanceof EditableLink && this.globalSelectedGroup.getNumberOfChild() === 1) {
        let linkItem = this.globalSelectedGroup.wbItemGroup[0] as EditableLink;
        for(let [key, handle] of linkItem.linkHandlers) {
          if(handle.coreItem.hitTest(point, this.hitOption)) {
            return handle;
          }
        }
      } else {
        return null;
      }
    }
  }

  private findInLinkPorts(point): LinkPort {
    if(this.isSelecting) {
      if(this.globalSelectedGroup.getNumberOfChild() === 1) {
        let wbItem = this.globalSelectedGroup.wbItemGroup[0];
        if(wbItem instanceof WhiteboardShape) {
          let portMap = wbItem.linkPortMap;
          for(let [key, port] of portMap) {
            if(port.handlerCircleObject.hitTest(point, this.hitOption)) {
              return port;
            }
          }
        }
      }
    }
    return null;
  }

  private findInWhiteboardItems(point, tolerance?: number, excludeEditableLink?: boolean): WhiteboardItem {
    let whiteboardItems = this.whiteboardItemArray;

    for(let i = whiteboardItems.length - 1 ; i >= 0; i-- ){
      let value = whiteboardItems[i];

      // GSG면 건너뜀
      if(value instanceof GlobalSelectedGroup) {
        continue;
      }
      // ItemGroup도 건너뜀
      if(value instanceof ItemGroup){
        continue;
      }

      if(excludeEditableLink) {
        if(value instanceof EditableLink) {
          continue;
        }
      }

      let hitOption: { fill: boolean, segments: boolean, stroke: boolean, tolerance: number };

      if(!!tolerance) {
        hitOption = {
          fill: this.hitOption.fill,
          segments: this.hitOption.segments,
          stroke: this.hitOption.stroke,
          tolerance: tolerance
        }
      } else {
        hitOption = this.hitOption;
      }
      if(value.group.hitTest(point, hitOption)){
        if(value.isGrouped) {
          return value.parentEdtGroup;
        }
        return value;
      }
    }
    //못찾은 경우 null값 리턴

    return null;
  }

  public isHitGSG(point): boolean {
    let hitOption = { segments: true, stroke: true, fill: true, tolerance: 15 };
    if(!!this.globalSelectedGroup.bound) {
      return !!this.globalSelectedGroup.bound.hitTest(point, hitOption);
    } else if (this.globalSelectedGroup.wbItemGroup[0] instanceof EditableLink) {
      return !!this.globalSelectedGroup.wbItemGroup[0].coreItem.hitTest(point, hitOption);
    } else {
      return false;
    }
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
    let editableShape:EditableShape = this.globalSelectedGroup.wbItemGroup[0] as EditableShape;
    let pointTextItem = editableShape.editText;
    let htmlTextEditorWrapper = document.getElementById("textEditorWrapper");
    let htmlTextEditorElement = document.getElementById("textEditor");
    let padding = 5;

    this.isEditingText = true;
    editableShape.isEditing = true;

    // 기존 텍스트 숨김
    pointTextItem.sendToBack();

    // EditText bound 계산

    let htmlEditorPoint = this.posCalcService.advConvertPaperToNg(editableShape.topLeft.clone());

    let edtWidth = this.posCalcService.advConvertLengthPaperToNg(editableShape.width);
    let edtHeight = this.posCalcService.advConvertLengthPaperToNg(editableShape.height);

    // EditText HTML Element 스타일 설정
    this.setWrapperStyle(htmlTextEditorWrapper, htmlEditorPoint, edtWidth, edtHeight, padding);

    this.setEditorStyle(htmlTextEditorElement, edtWidth, padding, editableShape.textStyle);

    // 숨겨져있던 Editable 영역 표시
    window.setTimeout(() => { htmlTextEditorElement.focus(); }, 0);

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

    editableShape.rawTextContent = htmlTextEditorElement.innerHTML;

    htmlTextEditorElement.innerText = "";
  }

  private setWrapperStyle(element, point, width, height, padding) {
    element.style.left = point.x + "px";
    element.style.top = point.y  + "px";
    element.style.width = width - padding * 2 + "px";
    element.style.height = height - padding * 2 + "px";
  }

  private setEditorStyle(element, width, padding, style) {
    element.style.width = width - padding * 2 + "px";
    this.setEditorTextStyle(style);
  }

  public setEditorTextStyle(style) {
    let element = document.getElementById("textEditor");
    element.style.color = style.fontColor;
    element.style.fontFamily = style.fontFamily;
    element.style.fontSize = style.fontSize + "px";
    element.style.fontWeight = style.isBold ? "bold" : "normal";
    element.style.fontStyle = style.isItalic ? "italic" : "";
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
    // return this._idGenerator++;
    return -1;
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


  get currentProject(): Project {
    return this._currentProject;
  }

//#####################################
}
