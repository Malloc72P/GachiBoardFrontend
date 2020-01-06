import { Injectable } from '@angular/core';
import {PointerModeManagerService} from "../../Whiteboard/Pointer/pointer-mode-manager-service/pointer-mode-manager.service";
import {InfiniteCanvasService} from "../../Whiteboard/InfiniteCanvas/infinite-canvas.service";
import {PositionCalcService} from "../../Whiteboard/PositionCalc/position-calc.service";
import {ZoomControlService} from "../../Whiteboard/ZoomControl/zoom-control.service";
import * as paper from "paper";

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
  public initializeDebugingService(){
    this.paperProject = paper.project;
  }
}
