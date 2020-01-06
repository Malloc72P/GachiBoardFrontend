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

  public createPath(event) {
    let point: Point;

    if(event instanceof MouseEvent) {
      point = new Point(event.x, event.y);
    } else if (event instanceof TouchEvent) {
      point = new Point(event.touches[0].clientX, event.touches[0].clientY);
    } else {
      return;
    }

    this.newPath = new Path({
      segments: [new Point(point.x, point.y)],
      strokeWidth: this.strokeWidth,
      strokeColor: 'white',
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
