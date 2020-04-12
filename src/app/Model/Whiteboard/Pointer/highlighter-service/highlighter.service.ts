import { Injectable } from '@angular/core';
import {PositionCalcService} from "../../PositionCalc/position-calc.service";

import * as paper from 'paper';
import {DrawingLayerManagerService} from '../../InfiniteCanvas/DrawingLayerManager/drawing-layer-manager.service';
import {WhiteboardItemType} from '../../../Helper/data-type-enum/data-type.enum';

@Injectable({
  providedIn: 'root'
})
export class HighlighterService {
  private strokeColor = new paper.Color(255, 255, 0, 0.3);
  private strokeWidth = 20;
  private strokeWidthStep = 20;
  private newPath: paper.Path;
  private currentProject: paper.Project;

  constructor(
    private posCalcService: PositionCalcService,
    private layerService: DrawingLayerManagerService,
  ) { }

  public initializeHighLighterService(project: paper.Project) {
    this.currentProject = project;
  }

  public createPath(event) {
    this.createHighlightStroke(event.point);
    this.layerService.tempProject.activeLayer.addChild(this.newPath);
  }
  public drawPath(event) {
    this.newPath.add(event.point);
  }
  public endPath() {
    if(this.newPath != null) {
      //this.newPath.simplify(1);
      this.newPath.smooth({ type: 'catmull-rom', factor: 0.5 });
      this.layerService.addToDrawingLayer(this.newPath, WhiteboardItemType.HIGHLIGHT_STROKE);
      this.newPath = null;
    }
  }

  private createHighlightStroke(point) {
    this.newPath =  new paper.Path({
      segments: [new paper.Point(point.x, point.y)],
      strokeColor: this.strokeColor,
      strokeWidth: this.strokeWidth,
      strokeCap: 'round',
      strokeJoin: 'round',
    });
  }

  set setColor(color: paper.Color) {
    this.strokeColor = color;
  }
  set setWidth(width: number) {
    this.strokeWidth = width * this.strokeWidthStep;
  }
}
