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

import {TextStyle} from '../../Pointer/shape-service/text-style';
import {PositionCalcService} from '../../PositionCalc/position-calc.service';
import {ItemLifeCycleEnum, ItemLifeCycleEvent,} from '../../Whiteboard-Item/WhiteboardItemLifeCycle/WhiteboardItemLifeCycle';
import {SimpleRaster} from '../../Whiteboard-Item/Whiteboard-Shape/editable-raster/SimpleRaster/simple-raster';
import {GlobalSelectedGroup} from '../../Whiteboard-Item/ItemGroup/GlobalSelectedGroup/global-selected-group';
import {PointerModeEvent} from '../../Pointer/PointerModeEvent/pointer-mode-event';
import {InfiniteCanvasService} from '../infinite-canvas.service';
import {ItemGroup} from '../../Whiteboard-Item/ItemGroup/item-group';
import {LinkPort} from '../../Whiteboard-Item/Whiteboard-Shape/LinkPort/link-port';
import {EditableShape} from '../../Whiteboard-Item/Whiteboard-Shape/EditableShape/editable-shape';
import {ContextMenuService} from '../../ContextMenu/context-menu-service/context-menu.service';
import {EditableLink} from '../../Whiteboard-Item/Whiteboard-Shape/LinkPort/EditableLink/editable-link';
import {LinkerModeChangeEvent} from './LinkModeManagerService/LinkerModeChangeEvent/linker-mode-change-event';
import {LinkerMode} from './LinkModeManagerService/LinkMode/linker-mode';
import {EditableItemGroup} from '../../Whiteboard-Item/ItemGroup/EditableItemGroup/editable-item-group';
import {HorizonContextMenuService} from '../../ContextMenu/horizon-context-menu-service/horizon-context-menu.service';
import {WorkHistoryManager} from './WorkHistoryManager/work-history-manager';
import {CursorChangeService} from '../../Pointer/cursor-change-service/cursor-change.service';
import {ItemHandler} from '../../Whiteboard-Item/ItemAdjustor/ItemHandler/item-handler';
import {WhiteboardShape} from '../../Whiteboard-Item/Whiteboard-Shape/whiteboard-shape';
import {LinkHandler} from '../../Whiteboard-Item/Whiteboard-Shape/LinkPort/EditableLink/LinkHandler/link-handler';
import {WsWhiteboardController} from '../../../../Controller/Controller-WebSocket/websocket-manager/WhiteboardWsController/ws-whiteboard.controller';
import {WbItemEventManagerService} from '../../../../Controller/Controller-WebSocket/websocket-manager/WhiteboardWsController/wb-item-event-manager.service';
import {
  WbItemEvent,
  WbItemEventEnum
} from '../../../../Controller/Controller-WebSocket/websocket-manager/WhiteboardWsController/wb-item-event/wb-item-event';
import {WhiteboardItemFactory} from '../WhiteboardItemFactory/whiteboard-item-factory';
import {WbItemFactoryResult} from '../WhiteboardItemFactory/WbItemFactoryResult/wb-item-factory-result';
import {MinimapSyncService} from '../MinimapSync/minimap-sync.service';
import {WhiteboardItemDto} from '../../../../DTO/WhiteboardItemDto/whiteboard-item-dto';
import {WebsocketPacketDto} from '../../../../DTO/WebsocketPacketDto/WebsocketPacketDto';
import {WebsocketManagerService} from '../../../../Controller/Controller-WebSocket/websocket-manager/websocket-manager.service';
import {WbItemWork} from './WorkHistoryManager/WbItemWork/wb-item-work';
// @ts-ignore
import Layer = paper.Layer;
// @ts-ignore
import PointText = paper.PointText;
// @ts-ignore
import Point = paper.Point;
// @ts-ignore
import Project = paper.Project;
// @ts-ignore
import PaperScope = paper.PaperScope;

import {EditableShapeDto} from '../../../../DTO/WhiteboardItemDto/WhiteboardShapeDto/EditableShapeDto/editable-shape-dto';
import {WbItemPacketDto} from '../../../../DTO/WhiteboardItemDto/WbItemPacketDto/WbItemPacketDto';
import {ItemBlinderManagementService} from '../../OccupiedItemBlinder/item-blinder-management-service/item-blinder-management.service';
import {GlobalSelectedGroupDto} from '../../../../DTO/WhiteboardItemDto/ItemGroupDto/GlobalSelectedGroupDto/GlobalSelectedGroupDto';
import {UiService} from '../../../Helper/ui-service/ui.service';
import {HotKeyManagementService} from '../../HotKeyManagement/hot-key-management.service';
import {PointerMode} from '../../Pointer/pointer-mode-enum-service/pointer-mode-enum.service';



@Injectable({
  providedIn: 'root'
})
export class DrawingLayerManagerService {
  private _drawingLayer:Layer;

  private _currentProject:Project;
  private _tempProject:Project;
  private _cursorTrackerPaperProject:Project;

  public tempHtmlCanvas:HTMLCanvasElement;
  public mainHtmlCanvas:HTMLCanvasElement;

  private _contextMenu: ContextMenuService;

  private _currentLinkerMode:LinkerMode;

  private _currentPointerMode:PointerMode;
  private longTouchTimer;
  private fromPoint: Point;

  private _globalSelectedGroup:GlobalSelectedGroup;
  private _whiteboardItemArray:Array<WhiteboardItem>;
  private _editableLinkArray:Array<EditableLink>;

  private _isEditableLinkSelected:Boolean;

  private _linkIdGenerator = 0;

  private hitOption = { segments: true, stroke: true, fill: true, tolerance: 15 };

  @Output() globalLifeCycleEmitter:EventEmitter<any>  = new EventEmitter<any>();
  @Output() pointerModeEventEmitter:EventEmitter<any> = new EventEmitter<any>();
  @Output() selectModeEventEmitter:EventEmitter<any>  = new EventEmitter<any>();
  @Output() linkModeEventEmitter:EventEmitter<any>    = new EventEmitter<any>();

  constructor(
    private _posCalcService:PositionCalcService,
    private _infiniteCanvasService:InfiniteCanvasService,
    private _horizonContextMenuService: HorizonContextMenuService,
    private _cursorChangeService: CursorChangeService,
    private wbItemEventManagerService: WbItemEventManagerService,
    public  minimapSyncService: MinimapSyncService,
    private websocketManagerService: WebsocketManagerService,
    private blinderManagementService:ItemBlinderManagementService,
    private hotKeyManagementService:HotKeyManagementService,
    public uiService:UiService,
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

  initializeDrawingLayerService(paperProject, contextMenuService: ContextMenuService,
                                tempPaperProject, mainHtmlCanvas, tempHtmlCanvas, cursorTrackerPaperProject){
    this._currentProject = paperProject;
    this._tempProject = tempPaperProject;
    this._cursorTrackerPaperProject = cursorTrackerPaperProject;


    this._contextMenu = contextMenuService;

    this.mainHtmlCanvas = mainHtmlCanvas;
    this.tempHtmlCanvas = tempHtmlCanvas;

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
    this.editableLinkArray.push(editableLink);
  }
  public deleteWbLink(editableLink:EditableLink){
    let deleteIdx = this.editableLinkArray.indexOf(editableLink);
    if(deleteIdx > -1){
      this.editableLinkArray.splice(deleteIdx, 1);
    }
  }

  private initPointerHandler(){
    this.pointerModeEventEmitter.subscribe((data:PointerModeEvent)=>{
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

      let workHistoryManager = WorkHistoryManager.getInstance();

      switch (recvWbItemEvent.action) {
        case WbItemEventEnum.CREATE:
          WhiteboardItemFactory.buildWbItems(recvWbItemEvent.data, this.whiteboardItemArray)
            .subscribe((res:WbItemFactoryResult)=>{
              res.newWbItem.group.opacity = 1;
              res.newWbItem.coreItem.opacity = 1;
              res.newWbItem.zIndex = recvWbItemEvent.data.zIndex;
            });
          break;
        case WbItemEventEnum.CREATE_MULTIPLE:
          let wbItemDtos:Array<WhiteboardItemDto> = recvWbItemEvent.additionalData as Array<WhiteboardItemDto>;
          for(let wbItemDto of wbItemDtos){
            WhiteboardItemFactory.buildWbItems(wbItemDto, this.whiteboardItemArray)
              .subscribe((res:WbItemFactoryResult)=>{
                res.newWbItem.group.opacity = 1;
                res.newWbItem.coreItem.opacity = 1;
              });
          }
          break;
        case WbItemEventEnum.DELETE:
          let delItem = this.findItemById(recvWbItemEvent.data.id);
          if(delItem){
            this.blinderManagementService.onWbItemDestroy(delItem.id);
            this.deleteItemFromWbArray(delItem.id);
            delItem.destroyItemAndNoEmit();
            workHistoryManager.removeTask(recvWbItemEvent.data.id);
          }
          break;
        case WbItemEventEnum.DELETE_MULTIPLE:
          let delItemList:Array<WhiteboardItemDto> = recvWbItemEvent.data as Array<WhiteboardItemDto>;
          for(let currDelItem of delItemList){
            let delItem = this.findItemById(currDelItem.id);
            if(delItem){
              this.blinderManagementService.onWbItemDestroy(delItem.id);
              this.deleteItemFromWbArray(delItem.id);
              delItem.destroyItemAndNoEmit();
              workHistoryManager.removeTask(recvWbItemEvent.data.id);
            }
          }
          break;
        case WbItemEventEnum.OCCUPIED:
          let occupiedGsgDto:GlobalSelectedGroupDto = recvWbItemEvent.data as unknown as GlobalSelectedGroupDto;
          this.blinderManagementService.updateOccupiedData(occupiedGsgDto);
          break;
        case WbItemEventEnum.NOT_OCCUPIED:
          let notOccupiedGsgDto:GlobalSelectedGroupDto = recvWbItemEvent.data as unknown as GlobalSelectedGroupDto;
          this.blinderManagementService.updateNotOccupiedData(notOccupiedGsgDto);
          break;
        case WbItemEventEnum.UPDATE:
          let updateItem = this.findItemById(recvWbItemEvent.data.id);
          if(updateItem){
            updateItem.update(recvWbItemEvent.data);
            workHistoryManager.removeTask(recvWbItemEvent.data.id);
          }
          break;
        case WbItemEventEnum.UPDATE_MULTIPLE:
          let wbItemDtoList:Array<WhiteboardItemDto> = recvWbItemEvent.data as Array<WhiteboardItemDto>;
          for(let wbItemDto of wbItemDtoList){
            let updateItem = this.findItemById(wbItemDto.id);
            if(updateItem){
              updateItem.update(wbItemDto);
              workHistoryManager.removeTask(wbItemDto.id);
              if (recvWbItemEvent.additionalData) {
                this.blinderManagementService.updateOccupiedData(recvWbItemEvent.additionalData);
              }
            }
            //this.blinderManagementService.updateOccupiedData()
          }
          break;
        case WbItemEventEnum.UPDATE_ZIndex:
          this.updateZIndex(recvWbItemEvent.additionalData);

          break;
        case WbItemEventEnum.READ:
          break;
        case WbItemEventEnum.LOCK:
          break;
        case WbItemEventEnum.UNLOCK:
          break;
      }
      this.minimapSyncService.syncMinimap();
    });
  }


  private initLifeCycleHandler(){
    WorkHistoryManager.initInstance(this);
    this.globalLifeCycleEmitter.subscribe((data:ItemLifeCycleEvent)=>{
      if(!data){
        return;
      }
      if( (data.item instanceof EditableItemGroup) || (data.item instanceof GlobalSelectedGroup) ){
        return;
      }
      let wsWbController = WsWhiteboardController.getInstance();
      let workHistoryManager = WorkHistoryManager.getInstance();
      // TODO : 라이프 사이클 체크용 로그
      switch (data.action) {
        case ItemLifeCycleEnum.CREATE:
          this.whiteboardItemArray.push(data.item);
          this.drawingLayer.addChild(data.item.group);
          break;
        case ItemLifeCycleEnum.MODIFY:
          /*wsWbController.waitRequestUpdateWbItem(data.item.exportToDto()).subscribe(()=>{
          });*/
          break;
        case ItemLifeCycleEnum.DESTROY:
          wsWbController.waitRequestDeleteWbItem(data.item.exportToDto()).subscribe((ackPacket)=>{
            this.deleteItemFromWbArray(data.id);
            /*workHistoryManager.pushIntoStack(new WbItemWork(ItemLifeCycleEnum.DESTROY, data.item.exportToDto()));*/
          });
          break;
      }
    });
  }
  deleteItemFromWbArray(id){
    let removeIdx = this.indexOfWhiteboardArray(id);
    if(removeIdx !== -1){
      this.whiteboardItemArray.splice(removeIdx, 1);
    }
  }
  /* **************************************************** */
  /* Whiteboard Item Lifecycle Handler END */
  /* **************************************************** */





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
  private initLinkModeHandler(){
    this.linkModeEventEmitter.subscribe((data:LinkerModeChangeEvent)=>{
      this.currentLinkerMode = data.currentLinkerMode;
    });
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
      this.uiService.spin$.next(true);
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
    if (newWhiteboardItem) {
      let wsWbController = WsWhiteboardController.getInstance();
      wsWbController.waitRequestCreateWbItem(newWhiteboardItem.exportToDto())
        .subscribe((packetDto) => {
          newWhiteboardItem.id = packetDto.dataDto.id;
          newWhiteboardItem.zIndex = packetDto.dataDto.zIndex;
          let workHistoryManager = WorkHistoryManager.getInstance();
          workHistoryManager.pushIntoStack(new WbItemWork(ItemLifeCycleEnum.CREATE, newWhiteboardItem.exportToDto()));

          if(newWhiteboardItem instanceof SimpleRaster){
            this.uiService.spin$.next(false);
          }
        });
    }
    return newWhiteboardItem;
  }

  get isSelecting(): boolean {
    return this.globalSelectedGroup.getNumberOfChild() > 0;
  }


  //##### 화이트보드 아이템을 찾는 메서드 #######
  public indexOfWhiteboardArray(id){
    let children = this.whiteboardItemArray;
    for(let i = 0 ; i < children.length; i++){
      if(children[i].id === id){
        return i
      }
    }
    return -1;
  }

  public findItemById(id){
    for(let wbItem of this.whiteboardItemArray){
      if(wbItem.id === id){
        return wbItem
      }
    }
    return null;
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

      if(value.isOccupied){
        //다른 유저에 의해 선점된 아이템이면 건너뜀
        continue;
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


  private prevTextShape:EditableShape = null;
  private prevTextShapeDto:EditableShapeDto = null;

  public startEditText() {
    let editableShape:EditableShape = this.globalSelectedGroup.wbItemGroup[0] as EditableShape;
    this.hotKeyManagementService.disableHotKeySystem();

    this.prevTextShapeDto = editableShape.exportToDto();
    this.prevTextShape = editableShape;

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
    let editableShape:EditableShape = this.editTextShape;
    this.hotKeyManagementService.enableHotKeySystem();

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

    let workHistoryManager = WorkHistoryManager.getInstance();
    let wbItemWork = new WbItemWork(ItemLifeCycleEnum.MODIFY, this.prevTextShapeDto);
    workHistoryManager.pushIntoStack(wbItemWork);

    let updateList:Array<WhiteboardItemDto> = new Array<WhiteboardItemDto>();
    updateList.push(this.editTextShape.exportToDto());
    let wsWbController = WsWhiteboardController.getInstance();
    wsWbController.waitRequestUpdateMultipleWbItem(updateList).subscribe(()=>{

    });

    this.prevTextShape.globalEmitModify();

    this.prevTextShape = null;
    this.prevTextShapeDto = null;
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
    let newGroup:Array<any> = new Array<any>();
    for (let i = 0; i < gsg.wbItemGroup.length; i++) {
      let currWbItem = gsg.wbItemGroup[i];
      newGroup.push(currWbItem.id);
    }

    for (let i = 0; i < gsg.wbItemGroup.length; i++) {
      let currWbItem = gsg.wbItemGroup[i];
      currWbItem.groupedIdList = newGroup;
    }

    let wsWbController = WsWhiteboardController.getInstance();
    let dtoList = this.globalSelectedGroup.exportSelectionToDto();
    wsWbController.waitRequestUpdateMultipleWbItem(dtoList).subscribe(()=>{});

    this.globalSelectedGroup.extractAllFromSelection();
  }

  public ungroupSelectedItems(){
    let gsg = this.globalSelectedGroup;
    for (let i = 0; i < gsg.wbItemGroup.length; i++) {
      let currWbItem = gsg.wbItemGroup[i];
      if (currWbItem.groupedIdList) {
        currWbItem.groupedIdList.splice(0, currWbItem.groupedIdList.length);
      }
    }

    let wsWbController = WsWhiteboardController.getInstance();
    let dtoList = this.globalSelectedGroup.exportSelectionToDto();
    wsWbController.waitRequestUpdateMultipleWbItem(dtoList).subscribe(()=>{});

    this.globalSelectedGroup.extractAllFromSelection();
  }

  public applyZIndex(){
    this.whiteboardItemArray.sort((prev, next)=>{
      if(prev.zIndex < next.zIndex){
        return -1;
      }else return 1;
    });
    for (let i = 0; i < this.whiteboardItemArray.length; i++) {
      this.drawingLayer.insertChild(i, this.whiteboardItemArray[i].group);
    }
/*    let intersectedWbItemList:Array<WhiteboardItem>;

    intersectedWbItemList = this.getIntersectedList(touchedWbItem);
    intersectedWbItemList.sort((prevWbItem, currWbItem)=>{
      if(prevWbItem.zIndex < currWbItem.zIndex){
        return -1;
      }else return 1;
    });

    for(let currItem of intersectedWbItemList){
      currItem.group.bringToFront();
      currItem.isVisited = true;
    }*/

  }

  getIntersectedList(entryItem:WhiteboardItem){
    let intersectedWbItemMap:Map<any, WhiteboardItem> = new Map<any, WhiteboardItem>();
    let returnValue:Array<WhiteboardItem> = new Array<WhiteboardItem>();

    this.visitIntersectedWbItem(entryItem, intersectedWbItemMap, returnValue);

    return returnValue;
  }
  visitIntersectedWbItem(visitedWbItem:WhiteboardItem, intersectedWbItemMap:Map<any, WhiteboardItem>, returnValue:Array<WhiteboardItem>){
    //현재 아이템 방문
    returnValue.push(visitedWbItem);
    let newIntersectedItemList:Array<WhiteboardItem> = new Array<WhiteboardItem>();
    for (let i = 0; i < this.whiteboardItemArray.length; i++) {
      let currWbItem = this.whiteboardItemArray[i];
      if(visitedWbItem.group.intersects(currWbItem.group)){
        //붙어있음. 맵에 넣는 작업 수행
        if (!intersectedWbItemMap.has(currWbItem.id)) {
          intersectedWbItemMap.set(currWbItem.id, currWbItem);
          newIntersectedItemList.push(currWbItem);
        }
      }
    }

    //새로 찾은 Intersected 아이템 순회하면서 재귀호출
    for(let newIntersectedItem of newIntersectedItemList){
      this.visitIntersectedWbItem(newIntersectedItem, intersectedWbItemMap, returnValue);
    }
    return returnValue;
  }

  updateZIndex(recvWbPacketList:Array<WbItemPacketDto>){
    if(!recvWbPacketList){
      return;
    }
    for(let recvWbPacket of recvWbPacketList){
      let foundItem:WhiteboardItem = this.findItemById(recvWbPacket._id);
      if(foundItem){
        foundItem.zIndex = recvWbPacket.wbItemDto.zIndex;
        this.applyZIndex();
        if(foundItem.isOccupied){
          foundItem.updateBlindGroup();
        }
      }
    }
  }

  activateMainWbMode(){
    this.mainHtmlCanvas.style.zIndex = "0";
    this.tempHtmlCanvas.style.zIndex = "-2";
  }
  activateTempWbMode(){
    this.tempHtmlCanvas.style.zIndex = "0";
    this.mainHtmlCanvas.style.zIndex = "-2";
  }


  //########## Getter & Setter ##########

  public getWorkHistoryManager(){
    return WorkHistoryManager.getInstance();
  }

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


  get tempProject(): Project {
    return this._tempProject;
  }

  set tempProject(value: Project) {
    this._tempProject = value;
  }


  get cursorTrackerPaperProject(): Project {
    return this._cursorTrackerPaperProject;
  }

  set cursorTrackerPaperProject(value: Project) {
    this._cursorTrackerPaperProject = value;
  }

//#####################################
}
