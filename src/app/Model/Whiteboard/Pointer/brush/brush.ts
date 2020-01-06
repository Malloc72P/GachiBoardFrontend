import * as paper from 'paper';
// @ts-ignore
import Path = paper.Path;
// @ts-ignore
import Color = paper.Color;
// @ts-ignore
import Point = paper.Point;

export class Brush {
  private strokeColor = new Color(0, 0, 0);
  private strokeWidth = 1;
  private newPath: Path;

  constructor() { }

  public setColor(color: Color) {
    this.strokeColor = color;
  }
  public setWidth(width: number) {
    this.strokeWidth = width;
  }
  public createPath(event) {
    let point: Point;

    if(event instanceof MouseEvent) {
      point = new Point(event.x, event.y);
    } else if (event instanceof TouchEvent) {
      point = new Point(event.touches[0].clientX, event.touches[0].clientY);
    } else {
      return;
    }

    this.newPath =  new Path({
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

    this.newPath.add(new Point(point.x, point.y));
  }
  public endPath() {
    this.newPath.simplify(5);
  }
}
