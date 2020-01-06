import {Injectable} from '@angular/core';
import {PointerMode} from '../pointer-mode-enum-service/pointer-mode-enum.service';

import * as paper from 'paper';

import {InfiniteCanvasService} from "../../InfiniteCanvas/infinite-canvas.service";
import {BrushService} from '../brush-service/brush.service';
import {EraserService} from '../eraser-service/eraser.service';
import {LassoSelectorService} from '../lasso-selector-service/lasso-selector.service';
import {ZoomControlService} from "../../ZoomControl/zoom-control.service";
import {CanvasMoverService} from "../CanvasMover/canvas-mover.service";
import {PositionCalcService} from "../../PositionCalc/position-calc.service";

// @ts-ignore
import Point = paper.Point;

@Injectable({
  providedIn: 'root'
})

export class PointerModeManagerService {
  public currentPointerMode: number;
  public touchStart = false;
  public mouseDown = false;
  public currentProject;
  private prevTouchPoint = new Point(0,0);

  constructor(
      public brushService: BrushService,
      public eraser: EraserService,
      public lassoSelector: LassoSelectorService,
      private infiniteCanvasService:InfiniteCanvasService,
      private zoomCtrlService         : ZoomControlService,
      private canvasMoverService      : CanvasMoverService,
      private posCalcService          : PositionCalcService
    ) {
  }

  public initializePointerModeManagerService(currentProject) {
    this.currentPointerMode = PointerMode.MOVE;
    const htmlCanvasObject = document.getElementById("cv1") as HTMLCanvasElement;
    this.currentProject = currentProject;
    this.zoomCtrlService.initializeZoomControlService(this.currentProject);
    this.canvasMoverService.initializeCanvasMoverService(this.currentProject);

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
  }

  // Touch - Start Listener
  private onTouchStart(event) {
    event.preventDefault();
    this.prevTouchPoint = this.posCalcService
      .reflectZoomWithPoint(new Point(event.touches[0].clientX, event.touches[0].clientY));
    switch (this.currentPointerMode) {
      case PointerMode.MOVE:
        break;
      case PointerMode.DRAW:
        this.brushService.createPath(event);
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
      switch (this.currentPointerMode) {
        case PointerMode.MOVE:
          break;
        case PointerMode.DRAW:
          this.brushService.drawPath(event);
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
    }else{
      switch (this.currentPointerMode) {
        case PointerMode.MOVE:
          let endPoint
            = this.posCalcService.reflectZoomWithPoint(
            new Point( event.changedTouches[0].clientX, event.changedTouches[0].clientY )
          );
          let calcX = endPoint.x - this.prevTouchPoint.x ;
          let calcY = endPoint.y - this.prevTouchPoint.y ;

          let delta = new Point( -calcX, -calcY );
          console.log("WhiteboardMainComponent >> onTouchMove >> delta : ",delta);
          this.infiniteCanvasService.movingAlg();
          // @ts-ignore
          paper.view.scrollBy(delta);
          this.prevTouchPoint.x = endPoint.x;
          this.prevTouchPoint.y = endPoint.y;
          break;
        case PointerMode.DRAW:
          this.brushService.endPath();
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
  }

  // Mouse - Down Listener
  private onMouseDown(event) {
    event.preventDefault();
    this.mouseDown = true;
    switch (this.currentPointerMode) {
      case PointerMode.MOVE:
        this.canvasMoverService.onPointerDown(event);
        break;
      case PointerMode.DRAW:
        this.brushService.createPath(event);
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
    if(this.mouseDown) {
      switch (this.currentPointerMode) {
        case PointerMode.MOVE:
          this.canvasMoverService.onPointerMove(event);
          break;
        case PointerMode.DRAW:
          this.brushService.drawPath(event);
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
    this.mouseDown = false;
    switch (this.currentPointerMode) {
      case PointerMode.MOVE:
        this.canvasMoverService.onPointerDown(event);
        break;
      case PointerMode.DRAW:
        this.brushService.endPath();
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



}
