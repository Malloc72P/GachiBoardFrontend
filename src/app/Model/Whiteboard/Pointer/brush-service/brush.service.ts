import {Injectable} from '@angular/core';

import * as paper from 'paper';
import {PositionCalcService} from '../../PositionCalc/position-calc.service';
import {WhiteboardItemType} from '../../../Helper/data-type-enum/data-type.enum';
import {SimpleStroke} from '../../Whiteboard-Item/editable-stroke/SimpleStroke/simple-stroke';
// @ts-ignore
import Point = paper.Point;
// @ts-ignore
import Group = paper.Group;
// @ts-ignore
import Layer = paper.Layer;

import {DrawingLayerManagerService} from '../../InfiniteCanvas/DrawingLayerManager/drawing-layer-manager.service';


@Injectable({
  providedIn: 'root'
})
export class BrushService {
  private strokeColor = new paper.Color(0, 0, 0);
  private strokeWidth = 1;
  private newPath: paper.Path;
  private currentProject: paper.Project;
  private tempLayer:Layer;

  constructor(
    private posCalcService: PositionCalcService,
    private layerService: DrawingLayerManagerService,
  ) { }

  public initializeBrushService(project: paper.Project) {
    this.currentProject = project;
  }

  public createPath(event) {
    this.createSimpleStroke(event.point);
    this.layerService.tempProject.activeLayer.addChild(this.newPath);
  }

  public drawPath(event) {
    this.newPath.add(event.point);
  }

  public endPath() {
    if(!!this.newPath) {
      this.newPath.simplify(3);

      //addToDrawingLayer를 이용하여 아이템 append
      this.layerService.addToDrawingLayer(this.newPath, WhiteboardItemType.SIMPLE_STROKE);

      this.newPath = null;
      this.layerService.tempProject.activeLayer.removeChildren();
    }
  }

  private createSimpleStroke(point) {
    this.newPath =  new paper.Path({
      segments: [new Point(point.x, point.y)],
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
    this.strokeWidth = width;
  }
}
