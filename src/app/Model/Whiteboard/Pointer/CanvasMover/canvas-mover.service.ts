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
    private positionCalcService: PositionCalcService,
    private infiniteCanvasService:InfiniteCanvasService
  ) {

  }
  public initializeCanvasMoverService( currentProject: Project ){
    this.currentProject = currentProject;
  }

  public onPointerMove(event){
    this.movePositionByDelta(event);
  }
  public onPointerDown(event){
    this.movePositionByDelta(event);
  }

  private movePositionByDelta(event){
    let delta = this.positionCalcService.reflectZoomWithPoint(
      new Point( -event.movementX, -event.movementY )
    );
    this.infiniteCanvasService.movingAlg();
    // @ts-ignore
    paper.view.scrollBy(delta);
  }
}
