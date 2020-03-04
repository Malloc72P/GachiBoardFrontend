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
    }
    else {
      this.setContextMenuToDefault();
    }

    this.setPosition(point);
    this.contextMenuTrigger.openMenu();
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
    this._contextMenuItems.splice(0, this._contextMenuItems.length);
    for (let key in ShapeContextMenu) {
      if(ShapeContextMenu.hasOwnProperty(key)) {
        this._contextMenuItems.push(ShapeContextMenu[key]);
      }
    }
  }
  private setContextMenuToStroke() {
    this._contextMenuItems.splice(0, this._contextMenuItems.length);
    for (let key in StrokeContextMenu) {
      if(StrokeContextMenu.hasOwnProperty(key)) {
        this._contextMenuItems.push(StrokeContextMenu[key]);
      }
    }
  }
  private setContextMenuToRaster() {
    this._contextMenuItems.splice(0, this._contextMenuItems.length);
    for (let key in RasterContextMenu) {
      if(RasterContextMenu.hasOwnProperty(key)) {
        this._contextMenuItems.push(RasterContextMenu[key]);
      }
    }
  }
  private setContextMenuToGroup() {
    this._contextMenuItems.splice(0, this._contextMenuItems.length);
    for (let key in GroupContextMenu) {
      if(GroupContextMenu.hasOwnProperty(key)) {
        this._contextMenuItems.push(GroupContextMenu[key]);
      }
    }
  }
  private setContextMenuToEditableLink() {
    this._contextMenuItems.splice(0, this._contextMenuItems.length);
    for (let key in EditableLinkContextMenu) {
      if(EditableLinkContextMenu.hasOwnProperty(key)) {
        this._contextMenuItems.push(EditableLinkContextMenu[key]);
      }
    }
  }

  private setContextMenuToDefault() {
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
