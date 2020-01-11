import {Injectable} from '@angular/core';
import * as paper from 'paper';
import {PositionCalcService} from '../../PositionCalc/position-calc.service';
import {ShapeStyle} from '../../../Helper/data-type-enum/data-type.enum';
import {min} from 'rxjs/operators';

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

    if(this._shapeStyle === ShapeStyle.ROUND_RECTANGLE) {
      this.newPath.remove();
      this.redrawRoundRectangle(bound);
      // let cornerWidth = Math.abs(this.newPath.bounds.bottomLeft.x - this.newPath.segments[0].point.x);
      // let cornerHeight = Math.abs(this.newPath.bounds.bottomLeft.y - this.newPath.segments[1].point.y);
      //
      // let min = Math.min(cornerWidth, cornerHeight);
      // this.newPath.segments[0].point.x = this.newPath.segments[0].point.x - (cornerWidth - min);
      // this.newPath.segments[1].point.y = this.newPath.segments[1].point.y + (cornerHeight - min);
      // this.newPath.segments[2].point.y = this.newPath.segments[2].point.y - (cornerHeight - min);
      // this.newPath.segments[3].point.x = this.newPath.segments[3].point.x - (cornerWidth - min);
      // this.newPath.segments[4].point.x = this.newPath.segments[4].point.x + (cornerWidth - min);
      // this.newPath.segments[5].point.y = this.newPath.segments[5].point.y - (cornerHeight - min);
      // this.newPath.segments[6].point.y = this.newPath.segments[6].point.y + (cornerHeight - min);
      // this.newPath.segments[7].point.x = this.newPath.segments[7].point.x + (cornerWidth - min);
    } else {
      this.newPath.bounds = bound;
    }
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
        this.createCircle(point);
        break;
      case ShapeStyle.TRIANGLE:
        this.createTriAngle(point);
        break;
      case ShapeStyle.ROUND_RECTANGLE:
        this.createRoundRectangle(point);
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
  private createCircle(point: paper.Point) {
    let center = new paper.Point(point.x + this.minSize / 2, point.y + this.minSize / 2);
    this.newPath = new paper.Path.Circle({
      center: center,
      radius: this.minSize / 2,
      strokeColor: this._strokeColor,
      strokeWidth: this._strokeWidth,
    });
  }
  private createTriAngle(point: paper.Point) {
    let center = new paper.Point(point.x + this.minSize / 2, point.y + this.minSize / 2);
    this.newPath = new paper.Path.RegularPolygon({
      center: center,
      sides: 3,
      radius: this.minSize / 2,
      strokeColor: this._strokeColor,
      strokeWidth: this._strokeWidth,
    });
  }
  private createRoundRectangle(point: paper.Point) {
    let toPoint = new paper.Point(point.x + this.minSize, point.y + this.minSize);
    let cornerSize = new paper.Size(this.minSize * 0.2, this.minSize * 0.2);
    this.newPath = new paper.Path.Rectangle({
      from: point,
      to: toPoint,
      radius: cornerSize,
      strokeColor: this._strokeColor,
      strokeWidth: this._strokeWidth,
    });
  }
  private redrawRoundRectangle(bound: paper.Rectangle) {
    let min = Math.min(bound.width, bound.height);
    this.newPath = new paper.Path.Rectangle(bound, new paper.Size(min * 0.1, min * 0.1));
    this.newPath.strokeColor = this._strokeColor;
    this.newPath.strokeWidth = this._strokeWidth;
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
