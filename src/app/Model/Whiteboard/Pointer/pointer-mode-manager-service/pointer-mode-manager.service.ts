import {Injectable} from '@angular/core';
import {PointerMode} from '../pointer-mode-enum-service/pointer-mode-enum.service';

import * as paper from 'paper';

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


// @ts-ignore
import Point = paper.Point;
import {MouseButtonEventEnum} from '../MouseButtonEventEnum/mouse-button-event-enum.enum';
import {PointerModeEvent} from '../PointerModeEvent/pointer-mode-event';
import {DrawingLayerManagerService} from '../../InfiniteCanvas/DrawingLayerManager/drawing-layer-manager.service';
import {PanelManagerService} from '../../Panel/panel-manager-service/panel-manager.service';

@Injectable({
  providedIn: 'root'
})

export class PointerModeManagerService {
  public currentPointerMode: number;
  public mouseDown = false;
  public currentProject;


  constructor(
      public brushService                 : BrushService,
      public eraser                       : EraserService,
      public shape                        : ShapeService,
      public lassoSelector                : LassoSelectorService,
      public highlighter                  : HighlighterService,
      private infiniteCanvasService       : InfiniteCanvasService,
      private zoomCtrlService             : ZoomControlService,
      private canvasMoverService          : CanvasMoverService,
      private posCalcService              : PositionCalcService,
      private minimapSyncService          : MinimapSyncService,
      private normalPointerService        : NormalPointerService,
      private layerService        : DrawingLayerManagerService,
      private panelManager: PanelManagerService,
    ) {
  }

  public initializePointerModeManagerService(currentProject) {

    this.currentPointerMode = PointerMode.POINTER;
    const htmlCanvasObject = document.getElementById("cv1") as HTMLCanvasElement;
    this.currentProject = currentProject;

    this.canvasMoverService.initializeCanvasMoverService(this.currentProject);
    this.brushService.initializeBrushService(this.currentProject);
    this.eraser.initializeEraserService(this.currentProject);
    this.lassoSelector.initializeLassoSelectorService(this.currentProject);
    this.shape.initializeShapeService(this.currentProject);
    this.normalPointerService.initializeNormalPointerService(this.currentProject);

    htmlCanvasObject.addEventListener("mousedown", (event) => {
      this.onMouseDown(event);
    });
    htmlCanvasObject.addEventListener("mousemove", (event) => {
      this.onMouseMove(event);
    });
    htmlCanvasObject.addEventListener("mouseup", (event) => {
      this.onMouseUp(event);
    });
    htmlCanvasObject.addEventListener("touchstart", (event) => {
      this.onTouchStart(event);
    });
    htmlCanvasObject.addEventListener("touchmove", (event) => {
      this.onTouchMove(event);
    });
    htmlCanvasObject.addEventListener("touchend", (event) => {
      this.onTouchEnd(event);
    });
    this.modeChange(PointerMode.POINTER);

    this.layerService.pointerModeEventEmitter.subscribe((data:PointerModeEvent)=>{
      this.lassoSelector.removeLassoPath();
    })
  }

  private _toolPanelToggleGroupValue;

  modeChange(mode: number) {
    this.currentPointerMode = this.toolPanelToggleGroupValue = mode;
    this.layerService.pointerModeEventEmitter.emit(new PointerModeEvent(mode));
  }

  public onClickPanelItem(panelItem: number) {
    switch (panelItem) {
      case PointerMode.POINTER:
        this.modeChange(panelItem);
        this.panelManager.isHideBrushPanel = this.panelManager.isHideHighlighterPanel = this.panelManager.isHideShapePanel = true;
        break;
      case PointerMode.MOVE:
        this.modeChange(panelItem);
        this.panelManager.isHideBrushPanel = this.panelManager.isHideHighlighterPanel = this.panelManager.isHideShapePanel = true;
        break;
      case PointerMode.DRAW:
        this.modeChange(panelItem);
        this.panelManager.isHideHighlighterPanel = this.panelManager.isHideShapePanel = true;
        this.panelManager.isHideBrushPanel = !this.panelManager.isHideBrushPanel;
        break;
      case PointerMode.HIGHLIGHTER:
        this.modeChange(panelItem);
        this.panelManager.isHideBrushPanel = this.panelManager.isHideShapePanel = true;
        this.panelManager.isHideHighlighterPanel = !this.panelManager.isHideHighlighterPanel;
        break;
      case PointerMode.SHAPE:
        this.modeChange(panelItem);
        this.panelManager.isHideBrushPanel = this.panelManager.isHideHighlighterPanel = true;
        this.panelManager.isHideShapePanel = !this.panelManager.isHideShapePanel;
        break;
      case PointerMode.ERASER:
        this.modeChange(panelItem);
        this.panelManager.isHideBrushPanel = this.panelManager.isHideHighlighterPanel = this.panelManager.isHideShapePanel = true;
        break;
      case PointerMode.LASSO_SELECTOR:
        this.modeChange(panelItem);
        this.panelManager.isHideBrushPanel = this.panelManager.isHideHighlighterPanel = this.panelManager.isHideShapePanel = true;
        break;
      default:
        break;
    }
  }


  // Touch - Start Listener
  private onTouchStart(event) {
    event.preventDefault();

    switch (this.currentPointerMode) {
      case PointerMode.POINTER:
        this.normalPointerService.onTouchStart(event);
        break;
      case PointerMode.MOVE:
        this.canvasMoverService.onTouchStart(event);
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

    if(event.touches.length == 1){
      if(this.zoomCtrlService.isZooming > 0){
        return;
      }
      switch (this.currentPointerMode) {
        case PointerMode.POINTER:
          this.normalPointerService.onTouchMove(event);
          break;
        case PointerMode.MOVE:
          this.canvasMoverService.onTouchMove(event);
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
    else if (event.touches.length == 2) {
      //핀치줌
      this.zoomCtrlService.onPinchZoomMove(event);
    }

  }

  // Touch - End Listener
  private onTouchEnd(event) {
    event.preventDefault();
    if(this.zoomCtrlService.isZooming > 0) {
      this.zoomCtrlService.onPinchZoomEnd();
    }else if ( this.zoomCtrlService.isZooming == 0){
      switch (this.currentPointerMode) {
        case PointerMode.POINTER:
          this.normalPointerService.onTouchEnd(event);
          break;
        case PointerMode.MOVE:
          this.canvasMoverService.onTouchEnd(event);
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


  private static segmentVerifier(segment){
    if(!segment){//hit했지만, item을 못불러온 경우 리턴
      return false;
    }
    if(!segment.parent){//item은 있지만, 부모레이어가 없는 경우 리턴
      return  false;
    }
    return segment.parent.name !== 'mainframeMatrix';
  }
  private static advDraggier(segment, adjustedPosition, newCoordinate){
    segment.position.x = newCoordinate.x - adjustedPosition.x;
    segment.position.y = newCoordinate.y - adjustedPosition.y;
  }
  private static segmentParser(hitResult){
    let segment = null;
    //디버깅용. 해당 세그먼트의 타입이 뭔지 알기 위해 사용
    // if (hitResult !== null) {
    //   console.log("PointerModeManager >> segmentParser >> hitResult : ", hitResult.type);
    // }
    if (hitResult.type === 'segment') {//세그먼트를 선택한 경우
      //segment = hitResult.segment;
    }
    else if (hitResult.type === 'stroke') {//스트로크를 선택한 경우
      segment = hitResult.item;
    }
    else if(hitResult.type === 'pixel'){//레스터 이미지를 선택한 경우
      segment = hitResult.item;
    }
    else if(hitResult.type === 'fill'){//PointText를 선택한 경우
      segment = hitResult.item;
    }
    return segment;
  }


  get toolPanelToggleGroupValue() {
    return this._toolPanelToggleGroupValue;
  }

  set toolPanelToggleGroupValue(value) {
    this._toolPanelToggleGroupValue = value;
  }
}
