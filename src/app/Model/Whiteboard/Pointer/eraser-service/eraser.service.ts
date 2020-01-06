import { Injectable } from '@angular/core';
import * as paper from 'paper';
import {PositionCalcService} from "../../PositionCalc/position-calc.service";

@Injectable({
  providedIn: 'root'
})
export class EraserService {
  private strokeWidth = 10;
  private newPath: paper.Path;

  constructor(
    private posCalcService: PositionCalcService,
  ) { }

  public setWidth(value: number) {
    this.strokeWidth = value;
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
    this.newPath = new paper.Path({
      segments: [new paper.Point(point.x, point.y)],
      strokeWidth: this.strokeWidth,
      strokeColor: 'white',
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
    this.removeProcess(this.newPath);
    this.newPath.remove();
  }

  private removeProcess(path: paper.Path) {
    const currentProject = paper.project;
    for(const item of currentProject.activeLayer.children) {
      if(path.intersects(item)) {
        item.remove();
      }
    }
  }
}
