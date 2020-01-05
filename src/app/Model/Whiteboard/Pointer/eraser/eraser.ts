import * as paper from 'paper';
// @ts-ignore
import Path = paper.Path;
// @ts-ignore
import Point = paper.Point;

export class Eraser {
  private strokeWidth = 10;
  private newPath: Path;

  constructor() { }

  public setWidth(value: number) {
    this.strokeWidth = value;
  }

  public createPath(point) {
    this.newPath = new Path({
      segments: [new Point(point.x, point.y)],
      strokeWidth: this.strokeWidth,
      strokeColor: 'white',
      strokeCap: 'round',
      strokeJoin: 'round',
    });
  }
  public drawPath(point) {
    this.newPath.add(new Point(point.x, point.y));
  }
  public remove(point) {
    this.removeProcess(this.newPath);
    this.newPath.remove();
  }

  private removeProcess(path: Path) {
    const currentProject = paper.project;
    for(const item of currentProject.activeLayer.children) {
      if(path.intersects(item)) {
        item.remove();
      }
    }
  }
}
