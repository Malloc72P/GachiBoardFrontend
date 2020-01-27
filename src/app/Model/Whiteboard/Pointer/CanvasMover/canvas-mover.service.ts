import { Injectable } from '@angular/core';
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
import {PositionCalcService} from "../../PositionCalc/position-calc.service";
import {InfiniteCanvasService} from "../../InfiniteCanvas/infinite-canvas.service";
@Injectable({
  providedIn: 'root'
})
export class CanvasMoverService {
  private currentProject: Project;
  constructor(
    private positionCalcService   : PositionCalcService,
    private infiniteCanvasService : InfiniteCanvasService,
    private posCalcService        : PositionCalcService
  ) {

  }
  private prevTouchPoint = new Point(0,0);
  public initializeCanvasMoverService( currentProject: Project ){
    this.currentProject = currentProject;
  }

  public onMouseDown(event){
    this.movedByMouse(event);
  }
  public onMouseMove(event){
    this.movedByMouse(event);
  }
  public onMouseUp(event){
    this.movedByMouse(event);
  }

  public onTouchStart(event){
    this.prevTouchPoint = this.posCalcService.reflectZoomWithPoint(
        new Point(event.touches[0].clientX, event.touches[0].clientY)
    );
  }
  public onTouchMove(event){
    this.movedByTouch(event);
  }
  public onTouchEnd(event){
    this.movedByTouch(event);
  }

  public movedByMouse(event){
    let delta = this.positionCalcService.reflectZoomWithPoint(
      new Point( -event.movementX, -event.movementY )
    );
    // @ts-ignore
    paper.view.scrollBy(delta);
    this.infiniteCanvasService.solveDangerState();
  }

  public movedByTouch(event){
    let endPoint
      = this.posCalcService.reflectZoomWithPoint(
      new Point( event.changedTouches[0].clientX, event.changedTouches[0].clientY )
    );
    let calcX = endPoint.x - this.prevTouchPoint.x ;
    let calcY = endPoint.y - this.prevTouchPoint.y ;

    let delta = new Point( -calcX, -calcY );

    // @ts-ignore
    paper.view.scrollBy(delta);
    this.infiniteCanvasService.solveDangerState();

    this.prevTouchPoint.x = endPoint.x;
    this.prevTouchPoint.y = endPoint.y;
  }
}
