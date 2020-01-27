import { Injectable } from '@angular/core';
import {MatMenu, MatMenuTrigger} from "@angular/material/menu";
import {PositionCalcService} from "../../PositionCalc/position-calc.service";
import {DrawingLayerManagerService} from "../../InfiniteCanvas/DrawingLayerManager/drawing-layer-manager.service";

import * as paper from 'paper';
// @ts-ignore
import Point = paper.Point;
import {ContextMenu, ItemContextMenu} from "../../../../View/Whiteboard/whiteboard-context-menu/context-menu.enum";
import {EditableStroke} from '../../Whiteboard-Item/editable-stroke/editable-stroke';
import {EditableShape} from '../../Whiteboard-Item/Whiteboard-Shape/EditableShape/editable-shape';
import {WhiteboardItem} from '../../Whiteboard-Item/whiteboard-item';
import {EditableRaster} from '../../Whiteboard-Item/Whiteboard-Shape/editable-raster/editable-raster';
import {ItemGroup} from '../../Whiteboard-Item/ItemGroup/item-group';
import {EditTextManagementService} from '../../EditTextManagement/edit-text-management.service';

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
    let convertedPoint = this.positionCalcService.advConvertNgToPaper(new Point(event.x, event.y));

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
    }
    else {
      this.setContextMenuToDefault();
    }

    this.contextMenuPosition.x = event.clientX + 'px';
    this.contextMenuPosition.y = event.clientY + 'px';
    this.contextMenuTrigger.openMenu();
  }

  private setContextMenuToShape() {
    this._contextMenuItems.splice(0, this._contextMenuItems.length);
    for (let key in ItemContextMenu) {
      if(ItemContextMenu.hasOwnProperty(key)) {
        this._contextMenuItems.push(ItemContextMenu[key]);
      }
    }
  }
  private setContextMenuToStroke() {
    this._contextMenuItems.splice(0, this._contextMenuItems.length);
    for (let key in ItemContextMenu) {
      if(ItemContextMenu.hasOwnProperty(key)) {
        this._contextMenuItems.push(ItemContextMenu[key]);
      }
    }
  }
  private setContextMenuToRaster() {
    this._contextMenuItems.splice(0, this._contextMenuItems.length);
    for (let key in ItemContextMenu) {
      if(ItemContextMenu.hasOwnProperty(key)) {
        this._contextMenuItems.push(ItemContextMenu[key]);
      }
    }
  }
  private setContextMenuToGroup() {
    this._contextMenuItems.splice(0, this._contextMenuItems.length);
    for (let key in ItemContextMenu) {
      if(ItemContextMenu.hasOwnProperty(key)) {
        this._contextMenuItems.push(ItemContextMenu[key]);
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
    switch (menuItem) {
      // shape
      case ItemContextMenu.DELETE_SHAPE:
        this.deleteItem();
        break;
      case ItemContextMenu.EDIT_TEXT:
        let selectedItem = this.item;
        if(selectedItem instanceof EditableShape){
          this.layerService.startEditText();
        }
        break;

      case ContextMenu.ADD_IMAGE:
        this.addImage();
        break;
      default:
        break;
    }
  }

  private deleteItem() {
    this.item.destroyItem();
  }

  private addImage() {
    document.getElementById("fileInput").click();
  }

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
