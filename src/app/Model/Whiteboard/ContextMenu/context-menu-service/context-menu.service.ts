import * as paper from 'paper';

import {Injectable} from '@angular/core';
import {MatMenu, MatMenuTrigger} from '@angular/material/menu';
import {PositionCalcService} from '../../PositionCalc/position-calc.service';
import {DrawingLayerManagerService} from '../../InfiniteCanvas/DrawingLayerManager/drawing-layer-manager.service';
import {
  ContextMenu, EditableLinkContextMenu,
  GroupContextMenu,
  RasterContextMenu,
  ShapeContextMenu,
  StrokeContextMenu
} from '../../../../View/Whiteboard/whiteboard-context-menu/context-menu.enum';
import {EditableStroke} from '../../Whiteboard-Item/editable-stroke/editable-stroke';
import {EditableShape} from '../../Whiteboard-Item/Whiteboard-Shape/EditableShape/editable-shape';
import {WhiteboardItem} from '../../Whiteboard-Item/whiteboard-item';
import {EditableRaster} from '../../Whiteboard-Item/Whiteboard-Shape/editable-raster/editable-raster';
import {ItemGroup} from '../../Whiteboard-Item/ItemGroup/item-group';
import {EditTextManagementService} from '../../EditTextManagement/edit-text-management.service';
import {PointerMode} from '../../Pointer/pointer-mode-enum-service/pointer-mode-enum.service';
import {PointerModeManagerService} from '../../Pointer/pointer-mode-manager-service/pointer-mode-manager.service';
import {CursorTrackerService} from '../../CursorTracker/cursor-tracker-service/cursor-tracker.service';
import {WsWhiteboardController} from '../../../../Controller/Controller-WebSocket/websocket-manager/WhiteboardWsController/ws-whiteboard.controller';
import {WhiteboardItemDto} from '../../../../DTO/WhiteboardItemDto/whiteboard-item-dto';
import {Z_INDEX_ACTION} from '../../../Helper/http-helper/http-helper';
// @ts-ignore
import Point = paper.Point;
import {WebsocketPacketDto} from '../../../../DTO/WebsocketPacketDto/WebsocketPacketDto';
import {WbItemPacketDto} from '../../../../DTO/WhiteboardItemDto/WbItemPacketDto/WbItemPacketDto';
import {EditableLink} from '../../Whiteboard-Item/Whiteboard-Shape/LinkPort/EditableLink/editable-link';

@Injectable({
  providedIn: 'root'
})
export class ContextMenuService {
  private _contextMenuTrigger: MatMenuTrigger;
  private _contextMenu: MatMenu;
  private _contextMenuItems = new Array<string>();
  private _contextMenuPosition = { x: '0px', y: '0px' };

  private item;

  constructor(
    private positionCalcService: PositionCalcService,
    private layerService: DrawingLayerManagerService,
    private editTextManagementService: EditTextManagementService,
    private pointerModeManagerService: PointerModeManagerService,
    private cursorTrackerService: CursorTrackerService,
  ) { }

  public initializeContextMenuService(contextMenu: MatMenu, contextMenuTrigger: MatMenuTrigger) {
    console.log("ContextMenuService >> initializeContextMenuService >>  : ", );
    this._contextMenuTrigger = contextMenuTrigger;
    this._contextMenu = contextMenu;
  }

  public openMenu(event) {
    event.preventDefault();

    if(this.contextMenu._isAnimating) {
      // 열리거나 닫히거나 애니메이션 중이면 반응 X
      return;
    }
    let point = this.initPoint(event);
    let convertedPoint = this.positionCalcService.advConvertNgToPaper(point);

    let hitItem = this.layerService.getHittedItem(convertedPoint);
    if(hitItem instanceof WhiteboardItem){
      this.item = hitItem;
    }

    console.log("ContextMenuService >> openMenu >> 진입함");

    //1. GSG가 비어있는지 검사
    if(this.layerService.globalSelectedGroup.getNumberOfChild() === 0){
      //비어있다면
      //히트된 개체가 있으면 GSG에 넣는다
      //그리고 해당 개체에 맞는 메뉴모드로 동작한다
      if(hitItem){
        this.layerService.globalSelectedGroup.insertOneIntoSelection(hitItem);
        this.setMenuByInstance(hitItem);
      }else{
        //히트되지 않았다면, 공백영역을 클릭하거나 터치한것. 디폴트 메뉴모드로 동작
        this.setContextMenuToDefault();
      }
    }else{
      //안비었다면
      //우선 히트되었는지 검사
      if(hitItem){
        //히트된 아이템이 선택된 상태인지 검사(이는 GSG에 포함되었는지랑 같은 의미임.)
        if(hitItem.isSelected){
          //이미 아이템을 선택중이며, 선택중인 개체에 대고 멘뉴를 열려고 한 경우
          //GSG개체수가 1개인지 검사
          if(this.layerService.globalSelectedGroup.getNumberOfChild() === 1){
            //1개라면, 해당 개체에 맞는 메뉴모드로 동작
            this.setMenuByInstance(hitItem);
          }else{
            //1개보다 많다면 그룹용 메뉴모드로 동작
            this.setContextMenuToGroup();
          }
        }else if(this.layerService.isHitGSG(convertedPoint)){
          //개체는 히트했고 GSG에 포함된 개체는 아닌데 해당 영역이 GSG의 영역인 경우
          //그룹용 메뉴모드로 동작
          this.setContextMenuToGroup();
        }else{
          //개체는 히트했으나, GSG에 포함된 개체도 아니고, GSG영역도 아닌 경우
          //GSG를 비우고 히트된 아이템을 GSG에 넣는다.
          this.layerService.globalSelectedGroup.extractAllFromSelection();
          this.layerService.globalSelectedGroup.insertOneIntoSelection(hitItem);
          //그런 다음, 해당 개체유형에 맞는 메뉴모드로 동작한다.
          this.setMenuByInstance(hitItem);
        }
      }else{
        //히트된 아이템이 없는 경우에는...
        //메뉴오픈 이벤트가 발생한 좌표가 GSG인지 검사한다.
        if(this.layerService.isHitGSG(convertedPoint)){
          //만약 GSG영역에서 이벤트가 발생한 경우라면, 그룹용 메뉴모드로 동작한다
          this.setContextMenuToGroup();
        }else{
          //GSG영역에서 발생한 이벤트가 아니라면
          // 이는 GSG밖을 클릭하거나 터치한 경우이다. 따라서 공백영역을 클릭하거나 터치한것임.
          //GSG를 다 비우고 디폴트 메뉴모드로 동작한다
          this.layerService.globalSelectedGroup.extractAllFromSelection();
          this.setContextMenuToDefault();
        }
      }
    }

    this.setPosition(point);
    this.contextMenuTrigger.openMenu();
  }

  setMenuByInstance(hitItem){
    if(hitItem instanceof EditableStroke) {
      this.setContextMenuToStroke();
    } else if(hitItem instanceof EditableShape){
      this.setContextMenuToShape();
    } else if(hitItem instanceof EditableRaster){
      this.setContextMenuToRaster();
    } else if(hitItem instanceof ItemGroup){
      this.setContextMenuToGroup();
    } else if(hitItem instanceof EditableLink){
      this.setContextMenuToEditableLink();
    } else {
      this.setContextMenuToDefault();
    }
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

  private setPosition(point: Point) {
    this.contextMenuPosition.x = point.x + 'px';
    this.contextMenuPosition.y = point.y + 'px';
  }

  private setContextMenuToShape() {
    console.log("ContextMenuService >> setContextMenuToShape >> 진입함");
    this._contextMenuItems.splice(0, this._contextMenuItems.length);
    for (let key in ShapeContextMenu) {
      if(ShapeContextMenu.hasOwnProperty(key)) {
        this._contextMenuItems.push(ShapeContextMenu[key]);
      }
    }
  }
  private setContextMenuToStroke() {
    console.log("ContextMenuService >> setContextMenuToStroke >> 진입함");
    this._contextMenuItems.splice(0, this._contextMenuItems.length);
    for (let key in StrokeContextMenu) {
      if(StrokeContextMenu.hasOwnProperty(key)) {
        this._contextMenuItems.push(StrokeContextMenu[key]);
      }
    }
  }
  private setContextMenuToRaster() {
    console.log("ContextMenuService >> setContextMenuToRaster >> 진입함");
    this._contextMenuItems.splice(0, this._contextMenuItems.length);
    for (let key in RasterContextMenu) {
      if(RasterContextMenu.hasOwnProperty(key)) {
        this._contextMenuItems.push(RasterContextMenu[key]);
      }
    }
  }
  private setContextMenuToGroup() {
    console.log("ContextMenuService >> setContextMenuToGroup >> 진입함");
    this._contextMenuItems.splice(0, this._contextMenuItems.length);
    for (let key in GroupContextMenu) {
      if(GroupContextMenu.hasOwnProperty(key)) {
        this._contextMenuItems.push(GroupContextMenu[key]);
      }
    }
  }
  private setContextMenuToEditableLink() {
    console.log("ContextMenuService >> setContextMenuToEditableLink >> 진입함");
    this._contextMenuItems.splice(0, this._contextMenuItems.length);
    for (let key in EditableLinkContextMenu) {
      if(EditableLinkContextMenu.hasOwnProperty(key)) {
        this._contextMenuItems.push(EditableLinkContextMenu[key]);
      }
    }
  }

  private setContextMenuToDefault() {
    console.log("ContextMenuService >> setContextMenuToDefault >> 진입함");
    this._contextMenuItems.splice(0, this._contextMenuItems.length);
    for (let key in ContextMenu) {
      if(ContextMenu.hasOwnProperty(key)) {
        this._contextMenuItems.push(ContextMenu[key]);
      }
    }
  }

  public onClickContextMenu(menuItem: string) {
    let gsg = this.layerService.globalSelectedGroup;
    let wsWbController = WsWhiteboardController.getInstance();
    switch (menuItem) {
      // item
      case ShapeContextMenu.DELETE:
        this.deleteItem();
        break;
      case ShapeContextMenu.EDIT_TEXT:
        let selectedItem = this.item;
        if(this.layerService.globalSelectedGroup.getNumberOfChild() === 0){
          this.layerService.globalSelectedGroup.insertOneIntoSelection(selectedItem);
        }
        if(selectedItem instanceof EditableShape){
          this.layerService.startEditText();
        }
        break;
      case ShapeContextMenu.EDIT:
        console.log("ContextMenuService >> onClickContextMenu >> EDIT");
        this.pointerModeManagerService.modeChange(PointerMode.POINTER);
        this.layerService.globalSelectedGroup.insertOneIntoSelection(this.item);
        break;
      case ContextMenu.ADD_IMAGE:
        this.addImage();
        break;
      case GroupContextMenu.COPY:
        gsg.doCopy();
        break;
      case GroupContextMenu.PASTE:
        gsg.doPaste(this.cursorTrackerService.itsMe);
        break;
      case ShapeContextMenu.BRING_TO_FRONT:
      case RasterContextMenu.BRING_TO_FRONT:
      case StrokeContextMenu.BRING_TO_FRONT:
        let bringToFrontDtoList:Array<WhiteboardItemDto> = gsg.exportSelectionToDto();
        wsWbController.waitRequestUpdateZIndexWbItem(bringToFrontDtoList, Z_INDEX_ACTION.BRING_TO_FRONT)
          .subscribe((wsPacketDto:WebsocketPacketDto)=>{
            this.layerService.updateZIndex(wsPacketDto.additionalData);
        });
        break;
      case ShapeContextMenu.SEND_TO_BACK:
      case RasterContextMenu.SEND_TO_BACK:
      case StrokeContextMenu.SEND_TO_BACK:
        let sendToBackDtoList:Array<WhiteboardItemDto> = gsg.exportSelectionToDto();
        wsWbController.waitRequestUpdateZIndexWbItem(sendToBackDtoList, Z_INDEX_ACTION.SEND_TO_BACK)
          .subscribe((wsPacketDto:WebsocketPacketDto)=>{
            this.layerService.updateZIndex(wsPacketDto.additionalData);
        });
        break;
      default:
        break;
    }
  }

  private deleteItem() {
    this.layerService.globalSelectedGroup.destroyItem();
  }

  private addImage() {
    document.getElementById("fileInput").click();
  }

  // ######################## Check Method ########################


  // ######################## Getter & Setter ########################

  get contextMenuTrigger(): MatMenuTrigger {
    return this._contextMenuTrigger;
  }

  set contextMenuTrigger(value: MatMenuTrigger) {
    this._contextMenuTrigger = value;
  }

  get contextMenu(): MatMenu {
    return this._contextMenu;
  }

  set contextMenu(value: MatMenu) {
    this._contextMenu = value;
  }

  get contextMenuPosition(): { x: string; y: string } {
    return this._contextMenuPosition;
  }

  get contextMenuItems(): string[] {
    return this._contextMenuItems;
  }
}
