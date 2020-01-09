import { Injectable } from '@angular/core';
import {PositionCalcService} from "../../PositionCalc/position-calc.service";
// @ts-ignore
import Path = paper.Path;
// @ts-ignore
import Point = paper.Point;
// @ts-ignore
import PointText = paper.PointText;
// @ts-ignore
import Group = paper.Group;
// @ts-ignore
import Project = paper.Project;
// @ts-ignore
import Rectangle = paper.Path.Rectangle;
// @ts-ignore
import Circle = paper.Path.Circle;
// @ts-ignore
import Layer = paper.Layer;

import * as paper from 'paper';
import {InfiniteCanvasService} from "../infinite-canvas.service";
import {LassoSelectorService} from '../../Pointer/lasso-selector-service/lasso-selector.service';

@Injectable({
  providedIn: 'root'
})
export class ZoomControlService {

  public currentProject: Project;

  private prevDistance = 0;
  private currentDistance = 0;
  private midPoint = new Point(0,0);
  private pinchZoomSlower = 0;

  private readonly pinchZoomInSlowerLimit = 2;
  private readonly pinchZoomOutSlowerLimit = -2;

  public isZooming = 0;

  constructor(
    private infiniteCanvasService   : InfiniteCanvasService,
    private posCalcService          : PositionCalcService,
    private lassoSelectorService    : LassoSelectorService,
  ) {

  }

  public initializeZoomControlService( currentProject: Project ){
    this.currentProject = currentProject;
  }

  zoomControl(event) {
    // //console.log("WhiteboardMainComponent >> zoomControl >> event : ",event);
    event.preventDefault();


    if (!event.ctrlKey) {//컨트롤키 안 누르고 휠 돌리는 경우
      let ngCanvasCenter = this.posCalcService.getCenterOfBrowser();

      this.currentProject.view.zoom = this.infiniteCanvasService.changeZoom(
        this.currentProject.view.zoom,
        ngCanvasCenter,
        new Point(event.x, event.y),
        event.deltaY);
      this.lassoSelectorService.lassoHandleResizeForZooming(this.currentProject.view.zoom)
    }
  }

  onPinchZoomMove( event ){
    let p1 = new Point(event.touches[0].clientX, event.touches[0].clientY);
    let p2 = new Point(event.touches[1].clientX, event.touches[1].clientY);

    if (this.isZooming == 2) {//핀치줌 시작후 추가식별됨
      let currentDistance = this.posCalcService.calcPointDistanceOn2D(p1, p2);
      let ngCanvasCenter = this.posCalcService.getCenterOfBrowser();

      if(this.prevDistance <= currentDistance){//줌 인
        if( this.pinchZoomSlower < this.pinchZoomInSlowerLimit  ){
          if(this.pinchZoomSlower < 0){
            this.pinchZoomSlower = 0;
          }
          this.pinchZoomSlower++;
          return;
        }

        this.pinchZoomSlower = 0;
        this.currentProject.view.zoom = this.infiniteCanvasService.changeZoom(
          this.currentProject.view.zoom,
          ngCanvasCenter,
          this.midPoint,
          -100);
        this.prevDistance = currentDistance;
      }
      else{//줌 아웃
        if( this.pinchZoomSlower > this.pinchZoomOutSlowerLimit  ){
          if(this.pinchZoomSlower > 0){
            this.pinchZoomSlower = 0;
          }
          this.pinchZoomSlower--;
          return;
        }

        this.pinchZoomSlower = 0;
        this.currentProject.view.zoom = this.infiniteCanvasService.changeZoom(
          this.currentProject.view.zoom,
          ngCanvasCenter,
          this.midPoint,
          100);
        this.prevDistance = currentDistance;
      }
    } else {//핀치줌 시작하는 경우
      let currentDistance = this.posCalcService.calcPointDistanceOn2D(p1, p2);
      let midPoint = this.posCalcService.calcMidPointOn2D(p1, p2);

      this.isZooming = 2;

      this.midPoint = midPoint;
      this.currentDistance = currentDistance;
      this.prevDistance = currentDistance;

    }//핀치줌 시작하는 경우#####

  }
  onPinchZoomEnd(){
    this.isZooming--;
  }
  zoomInToCenter(){
    let ngCanvasCenter = this.posCalcService.getCenterOfBrowser();
    this.currentProject.view.zoom = this.infiniteCanvasService.changeZoom(
      this.currentProject.view.zoom,
      ngCanvasCenter,
      ngCanvasCenter,
      -100);

  }
  zoomOutToCenter(){
    let ngCanvasCenter = this.posCalcService.getCenterOfBrowser();
    this.currentProject.view.zoom = this.infiniteCanvasService.changeZoom(
      this.currentProject.view.zoom,
      ngCanvasCenter,
      ngCanvasCenter,
      100);

  }
}
