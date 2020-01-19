import {Component, EventEmitter, Input, OnInit, ViewChild} from "@angular/core";
import {MatMenuTrigger} from "@angular/material/menu";
import {PointerModeManagerService} from "../../../Model/Whiteboard/Pointer/pointer-mode-manager-service/pointer-mode-manager.service";
import {ItemContextMenu} from "./context-menu.enum";

import * as paper from 'paper';
// @ts-ignore
import Point = paper.Point;
import {DrawingLayerManagerService} from '../../../Model/Whiteboard/InfiniteCanvas/DrawingLayerManager/drawing-layer-manager.service';
import {PositionCalcService} from "../../../Model/Whiteboard/PositionCalc/position-calc.service";

@Component({
  selector: 'app-whiteboard-context-menu',
  templateUrl: './whiteboard-context-menu.component.html',
  styleUrls: ['./whiteboard-context-menu.component.css']
})

export class WhiteboardContextMenuComponent implements OnInit {
  @ViewChild(MatMenuTrigger, {static: false}) matMenuTrigger: MatMenuTrigger;
  @ViewChild('contextMenu', {static: true}) contextMenu;
  @Input() openEmitter: EventEmitter<any>;

  private HTMLContextMenu;
  private contextMenuItems = new Array<string>();

  private item;

  private contextMenuPosition = { x: '0px', y: '0px' };

  constructor(
    private pointerModeManagerService: PointerModeManagerService,
    private layerService: DrawingLayerManagerService,
    private positionCalcService: PositionCalcService,
  ) { }

  ngOnInit() {
    this.openEmitter.subscribe((event: MouseEvent) => {
      event.preventDefault();

      let convertedPoint = this.positionCalcService.advConvertNgToPaper(new Point(event.x, event.y));

      let item = this.layerService.getHittedItem(convertedPoint);

      // 아이템 찾음
      if(item != null) {
        this.item = item;
        this.setContextMenuToShape();
      // 아이템 찾지 못함
      } else {
        this.setContextMenuToDefault();
      }

     this.contextMenuPosition.x = event.clientX + 'px';
      this.contextMenuPosition.y = event.clientY + 'px';
      this.matMenuTrigger.openMenu();
    });

    document.addEventListener("mousedown", (event) => {
      this.onClickOutsideMenu(event);
    });
  }

  private onClickOutsideMenu(event) {
    this.HTMLContextMenu = document.getElementById("contextMenu");

    if(this.HTMLContextMenu){
      if(!this.HTMLContextMenu.contains(event.target)) {
        this.matMenuTrigger.closeMenu();
      }
    }
  }

  private setContextMenuToShape() {
    this.contextMenuItems.splice(0, this.contextMenuItems.length);
    for (let key in ItemContextMenu) {
      if(ItemContextMenu.hasOwnProperty(key)) {
        this.contextMenuItems.push(ItemContextMenu[key]);
      }
    }
  }

  private setContextMenuToDefault() {
    this.contextMenuItems.splice(0, this.contextMenuItems.length);
  }

  private onClickContextMenu(menuItem: string) {
    switch (menuItem) {
      // shape
      case ItemContextMenu.DELETE_SHAPE:
        this.deleteItem();
        break;
      case ItemContextMenu.EDIT:
        break;
      default:
        break;
    }
  }

  private deleteItem() {
    this.item.destroyItem();
  }
}
