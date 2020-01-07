import { Injectable } from '@angular/core';

import * as paper from 'paper';
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
import {PositionCalcService} from "../../PositionCalc/position-calc.service";

@Injectable({
  providedIn: 'root'
})
export class HighlighterService {
  private strokeColor = new paper.Color(255, 255, 0, 0.3);
  private strokeWidth = 3;
  private newPath: paper.Path;
  private currentProject: paper.Project;

  constructor(
    private posCalcService: PositionCalcService,
  ) { }

  public initializeHighLighterService(project: paper.Project) {
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
    this.newPath.simplify(3);
  }
}
