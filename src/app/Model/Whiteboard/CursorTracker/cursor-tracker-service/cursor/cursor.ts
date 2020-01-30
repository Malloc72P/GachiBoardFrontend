import * as paper from 'paper';
// @ts-ignore
import Point = paper.Point;
// @ts-ignore
import Color = paper.Color;
// @ts-ignore
import CompoundPath = paper.CompoundPath;
// @ts-ignore
import Group = paper.Group;
// @ts-ignore
import PointText = paper.PointText;

export class Cursor {
  private group: Group;
  private readonly pointer: CompoundPath;
  private readonly userName: PointText;

  constructor(color: Color) {
    const cursorPath = "M4 0l16 12.279-6.78 1.138 4.256 8.676-3.902 1.907-4.281-8.758-5.293 4.581z";
    this.pointer = new CompoundPath(cursorPath);
    this.pointer.fillColor = color;

    this.userName = new PointText(this.pointer.bounds.bottomRight);
    this.userName.fillColor = color;

    this.group = new Group();
    this.group.addChild(this.pointer);
    this.group.addChild(this.userName);

    this.group.shadowColor = new Color("grey");
    this.group.shadowBlur = 10;
    this.group.shadowOffset = new Point(1,1);
  }

  public setName(name: string) {
    this.userName.content = name;
  }

  public moveTo(point: Point) {
    this.group.tween({
      'bounds.topLeft': point
    }, {
      easing: 'linear',
      duration: 166,
    });
    this.group.bringToFront();
  }

  public remove() {
    this.group.removeChildren();
    this.group.remove();
  }
}
