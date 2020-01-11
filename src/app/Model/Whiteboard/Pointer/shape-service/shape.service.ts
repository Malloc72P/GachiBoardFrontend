import {Injectable} from '@angular/core';
import * as paper from 'paper';
import {PositionCalcService} from '../../PositionCalc/position-calc.service';
import {ShapeStyle} from '../../../Helper/data-type-enum/data-type.enum';

interface Points {
  point: paper.Point,
  delta: paper.Point,
}

@Injectable({
  providedIn: 'root'
})
export class ShapeService {
  private currentProject: paper.Project;
  private previousPoint: paper.Point = new paper.Point(0, 0);
  private newPath: paper.Path;
  private handlePath: paper.Path;
  private fromPoint: paper.Point;
  private minSize = 5;
  private _strokeColor = new paper.Color(0, 0, 0);
  private handlePathColor = new paper.Color(0, 0, 255, 0);
  private _strokeWidth = 1;
  private _shapeStyle: number = ShapeStyle.RECTANGLE;

  constructor(
    private positionCalcService: PositionCalcService,
  ) { }

  public initializeShapeService(project: paper.Project) {
    this.currentProject = project;
  }

  public createPath(event) {
    if(this.handlePath) {
      this.handlePath.remove();
    }
    let points: Points;
    points = this.initEvent(event);

    this.createSelectedShape(points.point);
    this.createHandleRectangle(points.point);

    this.fromPoint = points.point;
  }

  public drawPath(event) {
    let points: Points;
    points = this.initEvent(event);

    const width = this.fromPoint.x - points.point.x;
    if(width < this.minSize && width >= 0) {
      points.point.x = this.fromPoint.x - this.minSize;
    } else if (width > -this.minSize && width < 0) {
      points.point.x = this.fromPoint.x + this.minSize;
    }

    const height = this.fromPoint.y - points.point.y;
    if(height < this.minSize && height >= 0) {
      points.point.y = this.fromPoint.y - this.minSize;
    } else if (height > -this.minSize && height < 0) {
      points.point.y = this.fromPoint.y + this.minSize;
    }

    let bound = new paper.Rectangle(this.fromPoint, points.point);
    this.handlePath.bounds = bound;
    this.newPath.bounds = bound;
  }

  public endPath() {
    if(this.handlePath) {
      this.handlePath.remove();
    }
  }

  private initEvent(event: MouseEvent | TouchEvent): Points {
    let points: Points;

    if(event instanceof MouseEvent) {
      // Mouse Event 용 초기화
      points = {
        point: new paper.Point(event.x, event.y),
        delta : new paper.Point(event.movementX, event.movementY)
      };
    } else if (event instanceof TouchEvent) {
      points = {
        point: new paper.Point(event.touches[0].clientX, event.touches[0].clientY),
        delta: new paper.Point(event.touches[0].clientX - this.previousPoint.x, event.touches[0].clientY - this.previousPoint.y)
      };
      this.previousPoint = new paper.Point(points.point);
    }

    points.point = this.positionCalcService.advConvertNgToPaper(points.point);
    points.delta = this.positionCalcService.reflectZoomWithPoint(points.delta);

    return points;
  }

  private createSelectedShape(point: paper.Point) {
    switch (this.shapeStyle) {
      case ShapeStyle.RECTANGLE:
        this.createRectangle(point);
        break;
      case ShapeStyle.CIRCLE:
        break;
      case ShapeStyle.TRIANGLE:
        break;
      default:
        break;
    }
  }

  private createRectangle(point: paper.Point) {
    let toPoint = new paper.Point(point.x + this.minSize, point.y + this.minSize);
    this.newPath = new paper.Path.Rectangle({
      from: point,
      to: toPoint,
      strokeColor: this._strokeColor,
      strokeWidth: this._strokeWidth,
    });
  }
  private createHandleRectangle(point: paper.Point) {
    let toPoint = new paper.Point(point.x + this.minSize, point.y + this.minSize);
    this.handlePath = new paper.Path.Rectangle({
      from: point,
      to: toPoint,
      strokeColor: this.handlePathColor,
      strokeWidth: 1,
    })
  }

  set strokeColor(value: paper.Color) {
    this._strokeColor = value;
  }

  set strokeWidth(value: number) {
    this._strokeWidth = value;
  }

  set shapeStyle(value: number) {
    this._shapeStyle = value;
  }

  get shapeStyle(): number {
    return this._shapeStyle;
  }
}
