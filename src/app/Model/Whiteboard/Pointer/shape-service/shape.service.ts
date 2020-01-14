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
  private HTMLTextEditorElement;
  private HTMLCanvasElement;
  private previousPoint: paper.Point = new paper.Point(0, 0);
  private newPath: paper.Path;
  private handlePath: paper.Path;
  private fromPoint: paper.Point;

  private minSize = 5;
  private textEditorPadding = 5;
  private _strokeColor = new paper.Color(0, 0, 0);
  private handlePathColor = new paper.Color(0, 0, 255, 0);
  private _fillColor: paper.Color = null;
  private _strokeWidth = 1;
  private _shapeStyle: number = ShapeStyle.RECTANGLE;
  private _isHiddenEditText = true;

  private lastClickTime = 0;
  private isCreated = false;

  constructor(
    private positionCalcService: PositionCalcService,
  ) { }

  public initializeShapeService(project: paper.Project) {
    this.currentProject = project;
    this.HTMLTextEditorElement = document.getElementById("textEditor");
    this.HTMLCanvasElement = document.getElementById("cv1");
  }

  public createPath(event) {
    if(this.handlePath) {
      this.handlePath.remove();
    }
    let points: Points;
    points = this.initEvent(event);

    this.createHandleRectangle(points.point);

    this.fromPoint = points.point;
  }

  public drawPath(event) {
    let points: Points;
    points = this.initEvent(event);

    if(!this.isCreated){
      this.createSelectedShape(points.point);
      this.isCreated = true;
    }

    const width = this.fromPoint.x - points.point.x;
    if(width < this.minSize && width >= 0) {
      points.point.x = this.fromPoint.x - this.minSize;
    } else if (width > -this.minSize && width < 0) {
      points.point.x = this.fromPoint.x + this.minSize;
    }
    if(!event.shiftKey) {
      const height = this.fromPoint.y - points.point.y;
      if(height < this.minSize && height >= 0) {
        points.point.y = this.fromPoint.y - this.minSize;
      } else if (height > -this.minSize && height < 0) {
        points.point.y = this.fromPoint.y + this.minSize;
      }
    } else {
      // 정방형
    }

    let bound = new paper.Rectangle(this.fromPoint, points.point);
    this.handlePath.bounds = bound;

    if(this._shapeStyle === ShapeStyle.ROUND_RECTANGLE) {
      this.newPath.remove();
      this.drawRoundRectangle(bound);
    } else {
      this.newPath.bounds = bound;
    }
  }

  public endPath(event) {
    if(this.newPath == null) {
      return;
    }
    let points = this.initEvent(event);

    if(this.handlePath) {
      this.handlePath.remove();
    }

    if(this.fromPoint.equals(points.point)) {
      if(Date.now() - this.lastClickTime < 300) {
        const item = this.currentProject.activeLayer.getItems({
          match: (item) => {
            return item.contains(points.point);
          }
        }).pop();
        this.textEditStart(item.bounds);
        console.log('ShapeService >> endPath >> Double Click Occurred');
      }
    }
    this.lastClickTime = Date.now();
    this.setEditable(this.newPath);

    this.isCreated = false;
  }

  private textEditStart(bound: paper.Rectangle) {
    let topLeftPoint = this.positionCalcService.advConvertPaperToNg(bound.topLeft);

    let top = topLeftPoint.y;
    let left = topLeftPoint.x;

    let width = Math.min(this.getWidthOfHTMLElement(this.HTMLCanvasElement) - left, bound.width);
    let height = Math.min(this.getHeightOfHTMLElement(this.HTMLCanvasElement) - top, bound.height);

    this.HTMLTextEditorElement.style.top = top + "px";
    this.HTMLTextEditorElement.style.left = left + "px";
    this.HTMLTextEditorElement.style.width = width - 10 + "px";
    this.HTMLTextEditorElement.style.height = height - 10 + "px";

    this._isHiddenEditText = false;
    this.HTMLTextEditorElement.focus();

    document.addEventListener("mousedown", (event) => {
      this.onClickOutsidePanel(event, this.HTMLCanvasElement, topLeftPoint, bound.width);
    });
    document.addEventListener("touchstart", (event) => {
      this.onClickOutsidePanel(event, this.HTMLCanvasElement, topLeftPoint, bound.width);
    });
  }

  private textEditEnd(topLeftPoint: paper.Point, width) {
    this.HTMLTextEditorElement.blur();
    this._isHiddenEditText = true;
    this.calcPointTextRange(
      this.HTMLTextEditorElement.innerHTML.replace(/<div>([^<>]*)<\/div>/g, "\n$1"),
      this.positionCalcService.advConvertNgToPaper(topLeftPoint),
      width,
    );
  }

  private calcPointTextRange(text: string, topLeftPoint: paper.Point, width) {
    let startPoint = topLeftPoint;
    let calcText = "";
    let charWidth = 0;
    let calcWidth = 0;

    text.match(/./g).forEach(value => {
      charWidth = this.calcStringWidth(value);
      console.log('ShapeService >> match >> charWidth : ', charWidth);
      calcWidth += charWidth;

      if(calcWidth > width) {
        calcText += '\n';
        calcWidth = charWidth;
      }

      calcText += value;
    });

    return new paper.PointText({
      point: startPoint,
      content: calcText,
    });
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
      if(event.touches.length > 0) {
        points = {
          point: new paper.Point(event.touches[0].clientX, event.touches[0].clientY),
          delta: new paper.Point(event.touches[0].clientX - this.previousPoint.x, event.touches[0].clientY - this.previousPoint.y)
        };
      } else {
        points = {
          point: new paper.Point(event.changedTouches[0].clientX, event.changedTouches[0].clientY),
          delta: new paper.Point(event.changedTouches[0].clientX - this.previousPoint.x, event.changedTouches[0].clientY - this.previousPoint.y)
        }
      }
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
      fillColor: this._fillColor,
      strokeWidth: this._strokeWidth,
    });
  }
  private createCircle(point: paper.Point) {
    let center = new paper.Point(point.x + this.minSize / 2, point.y + this.minSize / 2);
    this.newPath = new paper.Path.Circle({
      center: center,
      radius: this.minSize / 2,
      strokeColor: this._strokeColor,
      fillColor: this._fillColor,
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
      fillColor: this._fillColor,
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
      fillColor: this._fillColor,
      strokeWidth: this._strokeWidth,
    });
  }
  private drawRoundRectangle(bound: paper.Rectangle) {
    let min = Math.min(bound.width, bound.height);
    this.newPath = new paper.Path.Rectangle(bound, new paper.Size(min * 0.1, min * 0.1));
    this.newPath.strokeColor = this._strokeColor;
    this.newPath.fillColor = this._fillColor;
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

  private getWidthOfHTMLElement(element) {
    return parseFloat(getComputedStyle(element, null).width.replace("px", ""));
  }
  private getHeightOfHTMLElement(element) {
    return parseFloat(getComputedStyle(element, null).height.replace("px", ""));
  }

  private onClickOutsidePanel(event, element, topLeftPoint: paper.Point, width) {
    if(element.contains(event.target)) {
      this.textEditEnd(topLeftPoint, width);
    }
  }

  private calcStringWidth(input: string): number {
    let tempPointText = new paper.PointText({
      content: input,
      fillColor: 'transparent',
    });
    let width = tempPointText.bounds.width;
    tempPointText.remove();

    return width;
  }

  private setEditable(path: paper.Path) {
    path.data.type = "EditText";
  }

  set strokeColor(value: paper.Color) {
    this._strokeColor = value;
  }

  set fillColor(value: paper.Color) {
    this._fillColor = value;
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

  get isHiddenEditText(): boolean {
    return this._isHiddenEditText;
  }
}
