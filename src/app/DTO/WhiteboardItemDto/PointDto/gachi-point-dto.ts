import * as paper from 'paper';
// @ts-ignore
import Point = paper.Point;

export class GachiPointDto {
  public x: number;
  public y: number;

  constructor(x, y) {
    this.x = x;
    this.y = y;
  }

  public static clone(dto: GachiPointDto): GachiPointDto {
    if(!!dto) {
      return new GachiPointDto(dto.x, dto.y);
    }
    return undefined;
  }

  public clone(): GachiPointDto {
    return new GachiPointDto(this.x, this.y);
  }

  public static getPaperPoint(dto: GachiPointDto): Point {
    return new Point(dto.x, dto.y);
  }
}
