import {Injectable} from '@angular/core';

import * as paper from 'paper';
import {PositionCalcService} from '../../PositionCalc/position-calc.service';
import {WhiteboardItemType} from '../../../Helper/data-type-enum/data-type.enum';
import {SimpleStroke} from '../../Whiteboard-Item/editable-shape/SimpleStroke/simple-stroke';
// @ts-ignore
import Point = paper.Point;
// @ts-ignore
import Group = paper.Group;
import {InfiniteCanvasService} from '../../InfiniteCanvas/infinite-canvas.service';
import {DrawingLayerManagerService} from '../../InfiniteCanvas/DrawingLayerManager/drawing-layer-manager.service';


@Injectable({
  providedIn: 'root'
})
export class BrushService {
  private strokeColor = new paper.Color(0, 0, 0);
  private strokeWidth = 1;
  private newPath: paper.Path;
  private currentProject: paper.Project;
  private newSimpleStroke;

  constructor(
    private posCalcService: PositionCalcService,
    private layerService: DrawingLayerManagerService,
  ) { }

  public initializeBrushService(project: paper.Project) {
    this.currentProject = project;
  }

  public setColor(color: paper.Color) {
    this.strokeColor = color;
  }
  public setWidth(width: number) {
    this.strokeWidth = width;
  }
  public createPath(event) {
    let point: paper.Point;

    if(event instanceof MouseEvent) {
      point = new Point(event.x, event.y);
    } else if (event instanceof TouchEvent) {
      point = new Point(event.touches[0].clientX, event.touches[0].clientY);
    } else {
      return;
    }
    point = this.posCalcService.advConvertNgToPaper(point);

    this.newPath =  new paper.Path({
      segments: [new Point(point.x, point.y)],
      strokeColor: this.strokeColor,
      strokeWidth: this.strokeWidth,
      strokeCap: 'round',
      strokeJoin: 'round',
    });
  }
  public drawPath(event) {
    let point: Point;

    if(event instanceof MouseEvent) {
      point = new Point(event.x, event.y);
    } else if (event instanceof TouchEvent) {
      point = new Point(event.touches[0].clientX, event.touches[0].clientY);
    } else {
      return;
    }
    point = this.posCalcService.advConvertNgToPaper(point);
    this.newPath.add(new Point(point.x, point.y));
  }
  public endPath() {
    if(this.newPath != null) {
      this.newPath.simplify(3);

      //addToDrawingLayer를 이용하여 아이템 append
      this.layerService.addToDrawingLayer(this.newPath);

      this.newPath = null;
    }
  }


}
