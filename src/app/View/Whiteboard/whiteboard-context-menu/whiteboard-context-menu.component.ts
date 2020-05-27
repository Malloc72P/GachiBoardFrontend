import {Component, EventEmitter, Input, OnInit, ViewChild, AfterViewInit} from "@angular/core";
import {MatMenuTrigger} from "@angular/material/menu";
import {DrawingLayerManagerService} from '../../../Model/Whiteboard/InfiniteCanvas/DrawingLayerManager/drawing-layer-manager.service';
import {PositionCalcService} from "../../../Model/Whiteboard/PositionCalc/position-calc.service";
import {ContextMenuService} from "../../../Model/Whiteboard/ContextMenu/context-menu-service/context-menu.service";

import * as paper from 'paper';
// @ts-ignore
import Point = paper.Point;

@Component({
  selector: 'app-whiteboard-context-menu',
  templateUrl: './whiteboard-context-menu.component.html',
  styleUrls: ['./whiteboard-context-menu.component.css']
})

export class WhiteboardContextMenuComponent implements OnInit, AfterViewInit {
  @ViewChild(MatMenuTrigger) matMenuTrigger: MatMenuTrigger;
  @ViewChild('contextMenu', {static: true}) contextMenu;

  public HTMLContextMenu;

  constructor(
    public layerService: DrawingLayerManagerService,
    public positionCalcService: PositionCalcService,
    public contextMenuService: ContextMenuService,
  ) { }

  ngAfterViewInit() {
    this.contextMenuService.initializeContextMenuService(this.contextMenu, this.matMenuTrigger);
  }

  ngOnInit() {
    document.addEventListener("mousedown", (event) => {
      this.onClickOutsideMenu(event);
    });
  }

  public onClickOutsideMenu(event) {
    this.HTMLContextMenu = document.getElementById("contextMenu");

    if(this.HTMLContextMenu){
      if(!this.HTMLContextMenu.contains(event.target)) {
        this.matMenuTrigger.closeMenu();
      }
    }
  }


}
