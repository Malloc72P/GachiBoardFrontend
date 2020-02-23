import * as paper from 'paper';
// @ts-ignore
import Point = paper.Point;

export class GachiPointDto {
  public x:number;
  public y:number;

  constructor(x, y) {
    this.x = x;
    this.y = y;
  }

  public clone(): GachiPointDto {
    return new GachiPointDto(this.x, this.y);
  }



  get paperPoint(): Point {
    return new Point(this.x, this.y);
  }
}
