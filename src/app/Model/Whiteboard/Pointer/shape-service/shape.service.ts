import {Injectable} from '@angular/core';
import * as paper from 'paper';
import {PositionCalcService} from '../../PositionCalc/position-calc.service';
import {ShapeStyle} from '../../../Helper/data-type-enum/data-type.enum';
import {TextStyle} from "./text-style";


interface Points {
  point: paper.Point,
  delta: paper.Point,
}

@Injectable({
  providedIn: 'root'
})
export class ShapeService {
  private currentProject: paper.Project;
  private HTMLTextEditorElement: HTMLElement;
  private HTMLCanvasElement: HTMLElement;
  private previousPoint: paper.Point = new paper.Point(0, 0);
  private newPath: paper.Path;
  private handlePath: paper.Path;
  private fromPoint: paper.Point;

  private minSize = 5;
  private _strokeColor = new paper.Color(0, 0, 0);
  private handlePathColor = new paper.Color(0, 0, 255, 0);
  private _fillColor: paper.Color = null;
  private _strokeWidth = 1;
  private _shapeStyle: number = ShapeStyle.RECTANGLE;
  private _isHiddenEditText = true;
  private padding = 5;

  private outsideHandler;
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
            if(item.contains(points.point)){
              return item.data.type === "EditText";
            }
            return false;
          }
        }).pop();
        if(item != null) {
          this.textEditStart(item, item.data.textStyle);
        }
        console.log('ShapeService >> endPath >> Double Click Occurred');
      }
    }
    this.lastClickTime = Date.now();

    this.isCreated = false;
  }

  private textEditStart(item: paper.Item, textStyle: TextStyle) {
    // 기존 텍스트 제거
    if(item.data.pointTextId != undefined) {
      this.currentProject.activeLayer.getItem({
        id: item.data.pointTextId
      }).remove();
    }

    // EditText bound 계산
    let bound = item.bounds;
    item.data.editTextTopLeft = this.positionCalcService.advConvertPaperToNg(bound.topLeft);
    let top = item.data.editTextTopLeft.y;
    let left = item.data.editTextTopLeft.x;
    item.data.editTextWidth = Math.min(this.getWidthOfHTMLElement(this.HTMLCanvasElement) - left - this.padding * 2, bound.width) - this.padding * 2;
    item.data.editTextHeight = Math.min(this.getHeightOfHTMLElement(this.HTMLCanvasElement) - top - this.padding * 2, bound.height - this.padding * 2);
    item.data.editTextWidth = this.positionCalcService.advConvertLengthPaperToNg(item.data.editTextWidth);
    item.data.editTextHeight = this.positionCalcService.advConvertLengthPaperToNg(item.data.editTextHeight);

    // EditText HTML Element 스타일 설정
    this.HTMLTextEditorElement.style.top = top + "px";
    this.HTMLTextEditorElement.style.left = left + "px";
    this.HTMLTextEditorElement.style.width = item.data.editTextWidth + "px";
    this.HTMLTextEditorElement.style.height = item.data.editTextHeight + "px";
    this.HTMLTextEditorElement.style.fontFamily = textStyle.fontFamily;
    this.HTMLTextEditorElement.style.fontSize = textStyle.fontSize + "px";
    this.HTMLTextEditorElement.style.fontWeight = textStyle.fontWeight;

    // 숨겨져있던 Editable 영역 표시
    this._isHiddenEditText = false;
    this.HTMLTextEditorElement.focus(); // TODO : 포커스 안잡힘 이유 찾아야함
    this.HTMLTextEditorElement.innerText = item.data.rawText;

    this.outsideHandler = (event) => this.onClickOutsidePanel(event, this.HTMLCanvasElement, item);

    document.addEventListener("mousedown", this.outsideHandler);
    document.addEventListener("touchstart", this.outsideHandler);
  }

  private textEditEnd(item) {
    this.HTMLTextEditorElement.blur();
    this._isHiddenEditText = true;

    let topleft = this.positionCalcService.advConvertNgToPaper(item.data.editTextTopLeft);

    let temp = this.calcPointTextRange(
      // TODO div, br 태그 두가지 발견되는데 이거 처리할 표현식 만들어야함
      this.HTMLTextEditorElement.innerHTML.replace(/<div>([^<>]*)<\/div>/g, "\n$1"),
      topleft,
      this.positionCalcService.advConvertLengthNgToPaper(item.data.editTextWidth),
      this.positionCalcService.advConvertLengthNgToPaper(item.data.editTextHeight),
    );

    temp.bounds.topLeft = new paper.Point(
      topleft.x + this.padding,
      topleft.y + this.padding);
    item.data.rawText = this.HTMLTextEditorElement.innerText;
    this.HTMLTextEditorElement.innerText = "";
    item.data.pointTextId = temp.id;
    document.removeEventListener("mousedown", this.outsideHandler);
    document.removeEventListener("touchstart", this.outsideHandler);
  }

  private calcPointTextRange(text: string, topLeftPoint: paper.Point, width: number, height: number) {
    let calcText = "";
    let charWidth;
    let calcWidth = 0;
    let charHeight;
    let calcHeight = 0;

    let textStyle = new TextStyle();

    if(text == "") {
      calcText = "";
    } else {
      let tokenizedText = text.match(/./g);

      charHeight = this.calcStringHeight(tokenizedText[0], textStyle);
      calcHeight += charHeight; // 첫줄 계산 하고 시작
      for(let i = 0; i < tokenizedText.length; i++) {
        charWidth = this.calcStringWidth(tokenizedText[i], textStyle);

        calcWidth += charWidth;

        if(calcWidth > width) {
          calcHeight += charHeight;
          if(calcHeight > height) {
            break;
          }

          calcText += '\n';
          calcWidth = charWidth;
        }

        calcText += tokenizedText[i];
      }
    }

    console.log("ShapeService >> calcPointTextRange >> topLeftPoint : ", topLeftPoint);
    return new paper.PointText({
      fontFamily: textStyle.fontFamily,
      fontSize: textStyle.fontSize,
      fontWeight: textStyle.fontWeight,
      point: topLeftPoint,
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
    this.setEditable(this.newPath);
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
    this.setEditable(this.newPath);
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

  private onClickOutsidePanel(event, element, item) {
    if(element.contains(event.target)) {
      this.textEditEnd(item);
    }
  }

  private calcStringWidth(input: string, style: TextStyle): number {
    let tempPointText = new paper.PointText({
      fontFamily: style.fontFamily,
      fontSize: style.fontSize,
      fontWeight: style.fontWeight,
      content: input,
      fillColor: 'transparent',
    });
    let width = tempPointText.bounds.width;
    tempPointText.remove();

    return width;
  }
  private calcStringHeight(input: string, style: TextStyle): number {
    let tempPointText = new paper.PointText({
      fontFamily: style.fontFamily,
      fontSize: style.fontSize,
      fontWeight: style.fontWeight,
      content: input,
      fillColor: 'transparent',
    });
    let height = tempPointText.bounds.height;
    tempPointText.remove();

    return height;
  }

  private setEditable(path: paper.Path) {
    path.data.type = "EditText";
    path.data.textStyle = new TextStyle();
    path.data.rawText = "";
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
