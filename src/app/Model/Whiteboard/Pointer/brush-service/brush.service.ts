import { Injectable } from '@angular/core';
import * as paper from 'paper';

@Injectable({
  providedIn: 'root'
})
export class BrushService {
  private strokeColor = new paper.Color(0, 0, 0);
  private strokeWidth = 1;
  private newPath: paper.Path;

  constructor() { }

  public setColor(color: paper.Color) {
    this.strokeColor = color;
  }
  public setWidth(width: number) {
    this.strokeWidth = width;
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

    this.newPath.add(new paper.Point(point.x, point.y));
  }
  public endPath() {
    this.newPath.simplify(5);
  }
}
