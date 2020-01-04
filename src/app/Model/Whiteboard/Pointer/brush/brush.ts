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
  public createPath(point) {
    this.newPath =  new Path({
      segments: [new Point(point.x, point.y)],
      strokeColor: this.strokeColor,
      strokeWidth: this.strokeWidth,
      strokeCap: 'round',
      strokeJoin: 'round',
    });
  }
  public drawPath(point) {
    this.newPath.add(new Point(point.x, point.y));
  }
  public endPath(point) {
    this.newPath.simplify(5);
  }
}
