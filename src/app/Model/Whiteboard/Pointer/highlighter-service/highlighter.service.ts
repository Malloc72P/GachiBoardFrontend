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

  public setColor(color: paper.Color) {
    this.strokeColor = color;
  }
  public setWidth(width: number) {
    this.strokeWidth = width * this.strokeWidthStep;
  }
  public createPath(event) {
    let point: paper.Point;

    if(event instanceof MouseEvent) {
      point = new paper.Point(event.x, event.y);
    } else if (event instanceof TouchEvent) {
      point = new paper.Point(event.touches[0].clientX, event.touches[0].clientY);
    } else {
      return;
    }

    point = this.posCalcService.advConvertNgToPaper(point);
    this.newPath =  new paper.Path({
      segments: [new paper.Point(point.x, point.y)],
      strokeColor: this.strokeColor,
      strokeWidth: this.strokeWidth,
      strokeCap: 'round',
      strokeJoin: 'round',
    });
  }
  public drawPath(event) {
    let point: paper.Point;

    if(event instanceof MouseEvent) {
      point = new paper.Point(event.x, event.y);
    } else if (event instanceof TouchEvent) {
      point = new paper.Point(event.touches[0].clientX, event.touches[0].clientY);
    } else {
      return;
    }
    point = this.posCalcService.advConvertNgToPaper(point);
    this.newPath.add(new paper.Point(point.x, point.y));
  }
  public endPath() {
    if(this.newPath != null) {
      this.newPath.simplify(3);
      this.layerService.addToDrawingLayer(this.newPath, WhiteboardItemType.HIGHLIGHT_STROKE);
      this.newPath = null;
    }
  }
}
