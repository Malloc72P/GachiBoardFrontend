import { Injectable } from '@angular/core';
import {PointerModeManagerService} from "../../Whiteboard/Pointer/pointer-mode-manager-service/pointer-mode-manager.service";
import {InfiniteCanvasService} from "../../Whiteboard/InfiniteCanvas/infinite-canvas.service";
import {PositionCalcService} from "../../Whiteboard/PositionCalc/position-calc.service";
import {ZoomControlService} from "../../Whiteboard/InfiniteCanvas/ZoomControl/zoom-control.service";
import * as paper from "paper";

// @ts-ignore
import Item = paper.Item;
// @ts-ignore
import Path = paper.Path;
import {WhiteboardItem} from '../../Whiteboard/Whiteboard-Item/whiteboard-item';

class TestScope{
  whiteboardItem;
  id;
  data;
  position;
  bounds;
  originData;

  constructor(item:Item) {
    this.id = item.id;
    this.data = item.data;

    if(item.data.struct){
      this.whiteboardItem = item.data.struct;
    }
    this.position = item.position;
    this.bounds = item.bounds;
    this.originData = item;
  }

}

@Injectable({
  providedIn: 'root'
})
export class DebugingService {
  public paperProject;
  cursorX = 0;
  cursorY = 0;
  ngCursorX = 0;
  ngCursorY = 0;
  ngTouchCursorX = 0;
  ngTouchCursorY = 0;

  constructor(
    private pointerModeManager      : PointerModeManagerService,
    private infiniteCanvasService   : InfiniteCanvasService,
    private posCalcService          : PositionCalcService,
    private zoomControlService      : ZoomControlService,
  ) {

  }
  public initializeDebugingService(currentProject){
    this.paperProject = currentProject;
  }
  public logDrawingLayer(){
    console.log("\n\n");
    this.infiniteCanvasService.drawingLayer.children.forEach((value, index, array)=>{
      let testScope = new TestScope(value);
      console.log("DebugingService >> drawingLayer >> value : ",testScope);
    });
    console.log("\n\n");
  }
}
