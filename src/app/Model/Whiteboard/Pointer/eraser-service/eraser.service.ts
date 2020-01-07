import { Injectable } from '@angular/core';
import * as paper from 'paper';
import {PositionCalcService} from "../../PositionCalc/position-calc.service";

@Injectable({
  providedIn: 'root'
})
export class EraserService {
  private strokeWidth = 10;
  private eraserType = "eraser-trail";
  private newPath: paper.Path;
  private currentProject: paper.Project;

  constructor(
    private posCalcService: PositionCalcService,
  ) { }

  public initializeEraserService(project: paper.Project) {
    this.currentProject = project;
  }

  public setWidth(value: number) {
    this.strokeWidth = value;
  }

  public createPath(event) {
    let point: paper.Point;

    if(this.newPath){
      this.endPath();
    }

    if(event instanceof MouseEvent) {
      point = new paper.Point(event.x, event.y);
    } else if (event instanceof TouchEvent) {
      point = new paper.Point(event.touches[0].clientX, event.touches[0].clientY);
    } else {
      return;
    }
    point = this.posCalcService.advConvertNgToPaper(point);
    this.newPath = new paper.Path({
      segments: [new paper.Point(point.x, point.y)],
      strokeWidth: this.strokeWidth,
      strokeColor: 'lightgray',
      strokeCap: 'round',
      strokeJoin: 'round',
    });
    this.newPath.data.type = this.eraserType;
    this.removeProcess(this.newPath);
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
    this.removeProcess(this.newPath);
  }
  public endPath() {
    this.newPath.remove();
  }

  private removeProcess(path: paper.Path) {
    for(const item of this.currentProject.activeLayer.children) {
      if(path.intersects(item)) {
        if(!(item.data.type === this.eraserType)){
          item.remove();
        }
      }
    }
  }
}
