import {Injectable} from '@angular/core';
import {PointerMode} from '../pointer-mode-enum-service/pointer-mode-enum.service';


import {InfiniteCanvasService} from "../../InfiniteCanvas/infinite-canvas.service";
import {BrushService} from '../brush-service/brush.service';
import {EraserService} from '../eraser-service/eraser.service';
import {LassoSelectorService} from '../lasso-selector-service/lasso-selector.service';
import {ZoomControlService} from "../../InfiniteCanvas/ZoomControl/zoom-control.service";
import {CanvasMoverService} from "../CanvasMover/canvas-mover.service";
import {PositionCalcService} from "../../PositionCalc/position-calc.service";
import {MinimapSyncService} from '../../InfiniteCanvas/MinimapSync/minimap-sync.service';
import {HighlighterService} from '../highlighter-service/highlighter.service';
import {ShapeService} from '../shape-service/shape.service';
import {NormalPointerService} from '../normal-pointer-service/normal-pointer.service';


import * as paper from 'paper';
// @ts-ignore
import Project = paper.Project;
// @ts-ignore
import Point = paper.Point;

import {MouseButtonEventEnum} from '../MouseButtonEventEnum/mouse-button-event-enum.enum';
import {PointerModeEvent} from '../PointerModeEvent/pointer-mode-event';
import {DrawingLayerManagerService} from '../../InfiniteCanvas/DrawingLayerManager/drawing-layer-manager.service';
import {PanelManagerService} from '../../Panel/panel-manager-service/panel-manager.service';
import {CursorChangeService} from "../cursor-change-service/cursor-change.service";
import {LinkService} from "../link-service/link.service";
import {GachiPointDto} from '../../../../DTO/WhiteboardItemDto/PointDto/gachi-point-dto';
import {WsWhiteboardSessionController} from '../../../../Controller/Controller-WebSocket/websocket-manager/WhiteboardSessionWsController/ws-whiteboard-session.controller';
import {CursorTrackerService} from '../../CursorTracker/cursor-tracker-service/cursor-tracker.service';

@Injectable({
  providedIn: 'root'
})

export class PointerModeManagerService {
  public currentPointerMode: number;
  public mouseDown = false;
  public currentProject: Project;
  public tempProject: Project;

  private isThrottle: boolean = false;
  private prevPoint = new Point(0, 0);

  constructor(
      public brushService                 : BrushService,
      public eraser                       : EraserService,
      public shape                        : ShapeService,
      public link                         : LinkService,
      public lassoSelector                : LassoSelectorService,
      public highlighter                  : HighlighterService,
      private infiniteCanvasService       : InfiniteCanvasService,
      private zoomCtrlService             : ZoomControlService,
      private canvasMoverService          : CanvasMoverService,
      private posCalcService              : PositionCalcService,
      private minimapSyncService          : MinimapSyncService,
      private normalPointerService        : NormalPointerService,
      private layerService                : DrawingLayerManagerService,
      private panelManager                : PanelManagerService,
      private cursorChangeService         : CursorChangeService,
    ) { }

  public initializePointerModeManagerService(currentProject: Project, tempProject: Project) {

    this.currentPointerMode = PointerMode.POINTER;

    this.currentProject = currentProject;
    this.tempProject = tempProject;

    this.initPointerTools();

    this.setPointerCallback();

    this.modeChange(PointerMode.POINTER);

    this.layerService.pointerModeEventEmitter.subscribe((data:PointerModeEvent)=>{
      this.lassoSelector.removeLassoPath();
    })
  }

  initPointerTools(){
    this.canvasMoverService.initializeCanvasMoverService(this.currentProject);
    this.brushService.initializeBrushService(this.currentProject);
    this.eraser.initializeEraserService(this.currentProject);
    this.lassoSelector.initializeLassoSelectorService(this.currentProject);
    this.shape.initializeShapeService(this.currentProject);
    this.normalPointerService.initializeNormalPointerService(this.currentProject);
    this.cursorChangeService.initializeCursorChangeService();
  }

  setPointerCallback(){
    this.currentProject.view.onMouseDown = (event) => {
      this.onPointerDown(event);
    };

    this.currentProject.view.onMouseDrag = (event) => {
      this.onPointerDrag(event);
    };

    this.currentProject.view.onMouseUp = (event) => {
      this.onPointerUp(event)
    };

    this.tempProject.view.onMouseDown = (event) => {
      this.onPointerDown(event);
    };

    this.tempProject.view.onMouseDrag = (event) => {
      this.onPointerDrag(event);
    };

    this.tempProject.view.onMouseUp = (event) => {
      this.onPointerUp(event)
    };
  }

  onPointerDown(event){
    this.initDelta(event.event);
    if(event.event instanceof MouseEvent) {
      this.onMouseDown(event);
    } else {
      this.onTouchStart(event);
    }

  }
  onPointerDrag(event){
    /*if(this.isThrottle) {
      return;
    }*/

    // 수동으로 이벤트에서 델타 구해서 event.delta 를 덮어씌움
    event.delta = this.initDelta(event.event);

    /*this.isThrottle = true;
    setTimeout(() => {
      this.isThrottle = false;
    }, 10);*/

    if(event.event instanceof MouseEvent) {
      this.onMouseMove(event);
    } else {
      this.onTouchMove(event);
    }

  }
  onPointerUp(event){
    if(event.event instanceof MouseEvent) {
      this.onMouseUp(event);
    } else {
      this.onTouchEnd(event);
    }
  }

  private _toolPanelToggleGroupValue;

  modeChange(mode: PointerMode) {
    this.currentPointerMode = this.toolPanelToggleGroupValue = mode;
    this.cursorChangeService.syncCurrentPointerMode(mode);
    this.layerService.pointerModeEventEmitter.emit(new PointerModeEvent(mode));
  }

  public onClickPanelItem(panelItem: PointerMode) {
    this.panelManager.subPanel.hideOther(panelItem);
    switch (panelItem) {
      case PointerMode.POINTER:
        this.modeChange(panelItem);
        break;
      case PointerMode.MOVE:
        this.modeChange(panelItem);
        break;
      case PointerMode.DRAW:
        this.modeChange(panelItem);
        this.panelManager.subPanel.toggleThis(panelItem);
        break;
      case PointerMode.HIGHLIGHTER:
        this.modeChange(panelItem);
        this.panelManager.subPanel.toggleThis(panelItem);
        break;
      case PointerMode.SHAPE:
        this.modeChange(panelItem);
        this.panelManager.subPanel.toggleThis(panelItem);
        break;
      case PointerMode.LINK:
        this.modeChange(panelItem);
        this.panelManager.subPanel.toggleThis(panelItem);
        break;
      case PointerMode.ERASER:
        this.modeChange(panelItem);
        break;
      case PointerMode.LASSO_SELECTOR:
        this.modeChange(panelItem);
        break;
      default:
        break;
    }

    switch (panelItem) {
      //해당 포인터모드는 주 화이트보드를 전경에 놓고 동작함. 그래서 주 화이트보드의 콜백을 이용
      case PointerMode.POINTER:
      case PointerMode.MOVE:
      case PointerMode.SHAPE:
      case PointerMode.LINK:
        this.layerService.activateMainWbMode();
        break;
      //해당 포인터모드는 임시 화이트보드를 전경에 놓고 동작함. 그래서 임시 화이트보드의 콜백을 이용
      case PointerMode.DRAW:
      case PointerMode.HIGHLIGHTER:
      case PointerMode.ERASER:
      case PointerMode.LASSO_SELECTOR:
        this.layerService.activateTempWbMode();
        break;

    }
  }

  setAutoUpdateMode(isDownEvent){
    switch (this.currentPointerMode) {
      case PointerMode.DRAW:
      case PointerMode.HIGHLIGHTER:
      case PointerMode.ERASER:
      case PointerMode.LASSO_SELECTOR:
        this.currentProject.view.autoUpdate = !isDownEvent;
        break;
    }
  }


  // Touch - Start Listener
  private onTouchStart(event) {
    event.preventDefault();
    this.setAutoUpdateMode(true);

    switch (this.currentPointerMode) {
      case PointerMode.POINTER:
        this.normalPointerService.onMouseDown(event);
        break;
      case PointerMode.MOVE:
        this.canvasMoverService.onMouseDown(event);
        break;
      case PointerMode.DRAW:
        this.brushService.createPath(event);
        break;
      case PointerMode.HIGHLIGHTER:
        this.highlighter.createPath(event);
        break;
      case PointerMode.SHAPE:
        this.shape.createPath(event);
        break;
      case PointerMode.LINK:
        this.link.createLink(event);
        break;
      case PointerMode.ERASER:
        this.eraser.createPath(event);
        break;
      case PointerMode.LASSO_SELECTOR:
        this.lassoSelector.createPath(event);
        break;
      default:
        break;
    }
  }

  // Touch - Move Listener
  private onTouchMove(event) {
    event.preventDefault();

    if(event.event.touches.length == 1){
      if(this.zoomCtrlService.isZooming > 0){
        return;
      }
      switch (this.currentPointerMode) {
        case PointerMode.POINTER:
          this.normalPointerService.onMouseMove(event);
          break;
        case PointerMode.MOVE:
          this.canvasMoverService.onMouseMove(event);
          break;
        case PointerMode.DRAW:
          this.brushService.drawPath(event);
          break;
        case PointerMode.HIGHLIGHTER:
          this.highlighter.drawPath(event);
          break;
        case PointerMode.SHAPE:
          this.shape.drawPath(event);
          break;
        case PointerMode.LINK:
          this.link.drawLink(event);
          break;
        case PointerMode.ERASER:
          this.eraser.drawPath(event);
          break;
        case PointerMode.LASSO_SELECTOR:
          this.lassoSelector.drawPath(event);
          break;
        default:
          break;
      }
    }
    else if (event.event.touches.length == 2) {
      //핀치줌
      this.layerService.currentProject.view.autoUpdate = true;
      this.zoomCtrlService.onPinchZoomMove(event.event);
    }

  }

  // Touch - End Listener
  private onTouchEnd(event) {
    event.preventDefault();

    this.setAutoUpdateMode(false);

    if(this.zoomCtrlService.isZooming > 0) {
      this.zoomCtrlService.onPinchZoomEnd();
    }else if ( this.zoomCtrlService.isZooming == 0){
      switch (this.currentPointerMode) {
        case PointerMode.POINTER:
          this.normalPointerService.onMouseUp(event);
          break;
        case PointerMode.MOVE:
          this.canvasMoverService.onMouseUp(event);
          break;
        case PointerMode.DRAW:
          this.brushService.endPath();
          break;
        case PointerMode.HIGHLIGHTER:
          this.highlighter.endPath();
          break;
        case PointerMode.SHAPE:
          this.shape.endPath(event);
          break;
        case PointerMode.LINK:
          this.link.endLink(event);
          break;
        case PointerMode.ERASER:
          this.eraser.endPath();
          break;
        case PointerMode.LASSO_SELECTOR:
          this.lassoSelector.endPath(event);
          break;
        default:
          break;
      }

    }
    this.minimapSyncService.syncMinimap();
  }

  // Mouse - Down Listener
  private onMouseDown(event) {
    event.preventDefault();
    switch (event.button) {
      case MouseButtonEventEnum.LEFT_CLICK:
        break;
      case MouseButtonEventEnum.MIDDLE_CLICK:
        return;
      case MouseButtonEventEnum.RIGHT_CLICK:
        return;
    }
    this.mouseDown = true;
    this.setAutoUpdateMode(true);

    switch (this.currentPointerMode) {
      case PointerMode.POINTER:
        this.normalPointerService.onMouseDown(event);
        break;
      case PointerMode.MOVE:
        this.canvasMoverService.onMouseDown(event);
        this.cursorChangeService.changeToGrabbing();
        break;
      case PointerMode.DRAW:
        this.brushService.createPath(event);
        break;
      case PointerMode.HIGHLIGHTER:
        this.highlighter.createPath(event);
        break;
      case PointerMode.SHAPE:
        this.shape.createPath(event);
        break;
      case PointerMode.LINK:
        this.link.createLink(event);
        break;
      case PointerMode.ERASER:
        this.eraser.createPath(event);
        break;
      case PointerMode.LASSO_SELECTOR:
        this.lassoSelector.createPath(event);
        break;
      default:
        break;
    }
  }

  // Mouse - Move Listener
  private onMouseMove(event) {
    event.preventDefault();
    switch (event.button) {
      case MouseButtonEventEnum.LEFT_CLICK:
        break;
      case MouseButtonEventEnum.MIDDLE_CLICK:
        return;
      case MouseButtonEventEnum.RIGHT_CLICK:
        return;
    }

    if(this.mouseDown) {
      switch (this.currentPointerMode) {
        case PointerMode.POINTER:
          this.normalPointerService.onMouseMove(event);
          break;
        case PointerMode.MOVE:
          this.canvasMoverService.onMouseMove(event);
          break;
        case PointerMode.DRAW:
          this.brushService.drawPath(event);
          break;
        case PointerMode.HIGHLIGHTER:
          this.highlighter.drawPath(event);
          break;
        case PointerMode.SHAPE:
          this.shape.drawPath(event);
          break;
        case PointerMode.LINK:
          this.link.drawLink(event);
          break;
        case PointerMode.ERASER:
          this.eraser.drawPath(event);
          break;
        case PointerMode.LASSO_SELECTOR:
          this.lassoSelector.drawPath(event);
          break;
        default:
          break;
      }
    }
  }

  // Mouse - Up Listener
  private onMouseUp(event) {
    event.preventDefault();

    this.setAutoUpdateMode(false);

    switch (event.button) {
      case MouseButtonEventEnum.LEFT_CLICK:
        break;
      case MouseButtonEventEnum.MIDDLE_CLICK:
        return;
      case MouseButtonEventEnum.RIGHT_CLICK:
        return;
    }

    this.mouseDown = false;
    switch (this.currentPointerMode) {
      case PointerMode.POINTER:
        this.normalPointerService.onMouseUp(event);
        break;
      case PointerMode.MOVE:
        this.canvasMoverService.onMouseUp(event);
        this.cursorChangeService.changeToGrab();
        break;
      case PointerMode.DRAW:
        this.brushService.endPath();
        break;
      case PointerMode.HIGHLIGHTER:
        this.highlighter.endPath();
        break;
      case PointerMode.SHAPE:
        this.shape.endPath(event);
        break;
      case PointerMode.LINK:
        this.link.endLink(event);
        break;
      case PointerMode.ERASER:
        this.eraser.endPath();
        break;
      case PointerMode.LASSO_SELECTOR:
        this.lassoSelector.endPath(event);
        break;
      default:
        break;
    }
    this.minimapSyncService.syncMinimap();
  }

  private initDelta(html5Event: MouseEvent | TouchEvent): Point{
    let delta: Point;

    if(html5Event instanceof MouseEvent) {
      delta = new Point(html5Event.x - this.prevPoint.x, html5Event.y - this.prevPoint.y);
      this.prevPoint.x = html5Event.x;
      this.prevPoint.y = html5Event.y;
    } else {
      delta = new Point(html5Event.touches[0].clientX - this.prevPoint.x, html5Event.touches[0].clientY - this.prevPoint.y);
      this.prevPoint.x = html5Event.touches[0].clientX;
      this.prevPoint.y = html5Event.touches[0].clientY;

    }

    return this.posCalcService.reflectZoomWithPoint(delta);
  }


  get toolPanelToggleGroupValue() {
    return this._toolPanelToggleGroupValue;
  }

  set toolPanelToggleGroupValue(value) {
    this._toolPanelToggleGroupValue = value;
  }
}
