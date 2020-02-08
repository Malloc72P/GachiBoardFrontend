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
  // private prevTouchPoint = new Point(0,0);
  private prevPoint = new Point(0, 0);

  constructor(
    private positionCalcService   : PositionCalcService,
    private infiniteCanvasService : InfiniteCanvasService,
  ) {

  }
  public initializeCanvasMoverService( currentProject: Project ){
    this.currentProject = currentProject;
  }

  public onMouseDown(event){
    this.moveCanvas(event);
  }
  public onMouseMove(event){
    this.moveCanvas(event);
  }
  public onMouseUp(event){
    // this.moveCanvas(event);
  }

  // public onTouchStart(event){
  //   this.prevTouchPoint = this.posCalcService.reflectZoomWithPoint(
  //       new Point(event.touches[0].clientX, event.touches[0].clientY)
  //   );
  // }
  // public onTouchMove(event){
  //   this.movedByTouch(event);
  // }
  // public onTouchEnd(event){
  //   this.movedByTouch(event);
  // }

  public moveCanvas(event) {
    let delta = this.initDelta(event.event);

    this.infiniteCanvasService.moveWithDelta(delta);
    this.infiniteCanvasService.solveDangerState();
  }

  private initDelta(html5Event: MouseEvent | TouchEvent): Point{
    let delta: Point;

    if(html5Event instanceof MouseEvent) {
      delta = new Point(html5Event.movementX, html5Event.movementY);
      this.prevPoint.x = html5Event.x;
      this.prevPoint.y = html5Event.y;
    } else {
      delta = new Point(html5Event.touches[0].clientX - this.prevPoint.x, html5Event.touches[0].clientY - this.prevPoint.y);
      this.prevPoint.x = html5Event.touches[0].clientX;
      this.prevPoint.y = html5Event.touches[0].clientY;
    }

    return this.positionCalcService.reflectZoomWithPoint(delta);
  }

  // public movedByMouse(event){
  //   let delta = this.positionCalcService.reflectZoomWithPoint(
  //     new Point( -event.movementX, -event.movementY )
  //   );
  //   this.infiniteCanvasService.moveWithDelta(delta);
  //   this.infiniteCanvasService.solveDangerState();
  // }
  //
  // public movedByTouch(event){
  //   let endPoint = this.posCalcService.reflectZoomWithPoint(
  //     new Point( event.changedTouches[0].clientX, event.changedTouches[0].clientY )
  //   );
  //   let calcX = endPoint.x - this.prevTouchPoint.x ;
  //   let calcY = endPoint.y - this.prevTouchPoint.y ;
  //
  //   let delta = new Point( -calcX, -calcY );
  //
  //   // @ts-ignore
  //   this.infiniteCanvasService.moveWithDelta(delta);
  //   this.infiniteCanvasService.solveDangerState();
  //
  //   this.prevTouchPoint.x = endPoint.x;
  //   this.prevTouchPoint.y = endPoint.y;
  // }
}
