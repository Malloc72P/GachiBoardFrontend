import {Injectable} from '@angular/core';
import * as paper from 'paper';
import {PositionCalcService} from '../../PositionCalc/position-calc.service';
import {ShapeStyle, WhiteboardItemType} from '../../../Helper/data-type-enum/data-type.enum';
import {TextStyle} from "./text-style";
import {DrawingLayerManagerService} from '../../InfiniteCanvas/DrawingLayerManager/drawing-layer-manager.service';
import {WhiteboardItem} from '../../Whiteboard-Item/whiteboard-item';
import {EditableShape} from '../../Whiteboard-Item/editable-shape/editable-shape';
// @ts-ignore
import PointText = paper.PointText;
// @ts-ignore
import Group = paper.Group;
// @ts-ignore
import Point = paper.Point;


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
  private HTMLTextEditorWrapper: HTMLElement;
  private HTMLCanvasElement: HTMLElement;
  private previousPoint: paper.Point = new paper.Point(0, 0);
  private newPath: paper.Path;
  private handlePath: paper.Path;
  private fromPoint: paper.Point;

  private minSize = 5;
  private _strokeColor = new paper.Color(0, 0, 0);
  private handlePathColor = new paper.Color(0, 0, 255, 0);
  private _fillColor: paper.Color = new paper.Color(255, 255, 255, 1);
  private _strokeWidth = 1;
  private _shapeStyle: number = ShapeStyle.RECTANGLE;
  private _isHiddenEditText = true;
  private padding = 5;

  private outsideHandler;
  private lastClickTime = 0;
  private isCreated = false;

  constructor(
    private posCalcService: PositionCalcService,
    private layerService: DrawingLayerManagerService,
  ) { }

  public initializeShapeService(project: paper.Project) {
    this.currentProject = project;
    this.HTMLTextEditorElement = document.getElementById("textEditor");
    this.HTMLTextEditorWrapper = document.getElementById("textEditorWrapper");
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
        let selectedItem = this.layerService.getHittedItem(points.point);
        let editableShape = selectedItem.data.struct as EditableShape;

        if( editableShape.editText != null) {
          this.textEditStart(editableShape.editText);
        }
      }
    }
    this.lastClickTime = Date.now();

    this.isCreated = false;


  }
  private createShapeItem(){
    //#1 PointText 생성
    let newTextStyle = new TextStyle();
    let tempPointText = new PointText(
      {
        fontFamily: newTextStyle.fontFamily,
        fontSize: newTextStyle.fontSize,
        fontWeight: newTextStyle.fontWeight,
        point: this.newPath.bounds.topLeft,
        content: "",
      }
    );

    switch ( this.shapeStyle ) {
      case ShapeStyle.RECTANGLE :
        this.layerService.addToDrawingLayer(this.newPath,
          WhiteboardItemType.EDITABLE_RECTANGLE,
          tempPointText, newTextStyle);
        break;
      case ShapeStyle.CIRCLE :
        this.layerService.addToDrawingLayer(this.newPath,
          WhiteboardItemType.EDITABLE_CIRCLE,
          tempPointText, newTextStyle);
        break;
      case ShapeStyle.ROUND_RECTANGLE :
        this.layerService.addToDrawingLayer(this.newPath,
          WhiteboardItemType.EDITABLE_CARD,
          tempPointText, newTextStyle);
        break;
      case ShapeStyle.TRIANGLE :
        this.layerService.addToDrawingLayer(this.newPath,
          WhiteboardItemType.EDITABLE_TRIANGLE,
          tempPointText, newTextStyle);
        break;
    }
  }

  private textEditStart(pointTextItem) {

    let shapeGroup:Group = pointTextItem.parent as Group;
    // 기존 텍스트 제거
    //WhiteboardItem정보 가져오기
    let shapeItem = this.layerService.getWhiteboardItem(pointTextItem) as EditableShape;
    shapeItem.isEditing = true;

    // EditText bound 계산
    let bound = shapeItem.coreItem.bounds;

    let htmlEditorPoint = this.posCalcService.advConvertPaperToNg(new Point(shapeItem.topLeft.x, shapeItem.topLeft.y));

    let edtWidth = this.posCalcService.advConvertLengthPaperToNg(bound.width);
    let edtHeight = this.posCalcService.advConvertLengthPaperToNg(bound.height);

    let textStyle = new TextStyle();

    // EditText HTML Element 스타일 설정
    this.HTMLTextEditorWrapper.style.left = htmlEditorPoint.x + "px";
    this.HTMLTextEditorWrapper.style.top = htmlEditorPoint.y  + "px";
    this.HTMLTextEditorWrapper.style.width = edtWidth - this.padding * 2 + "px";
    this.HTMLTextEditorWrapper.style.height = edtHeight - this.padding * 2 + "px";

    this.HTMLTextEditorElement.style.width = edtWidth - this.padding * 2 + "px";
    this.HTMLTextEditorElement.style.fontFamily = textStyle.fontFamily;
    this.HTMLTextEditorElement.style.fontSize = textStyle.fontSize + "px";
    this.HTMLTextEditorElement.style.fontWeight = textStyle.fontWeight;

    // 숨겨져있던 Editable 영역 표시
    this._isHiddenEditText = false;
    window.setTimeout(() => {
      this.HTMLTextEditorElement.focus();
    }, 0);


    this.HTMLTextEditorElement.innerText = shapeItem.rawTextContent;

    this.outsideHandler = (event) => this.onClickOutsidePanel(event, this.HTMLCanvasElement, pointTextItem);

    document.addEventListener("mousedown", this.outsideHandler);
    document.addEventListener("touchstart", this.outsideHandler);

    shapeItem.editText.sendToBack();
  }


  //===============================================
  private textEditEnd(firedPointText) {
    console.log("ShapeService >> textEditEnd >> firedPointText : ",firedPointText);
    this.HTMLTextEditorElement.blur();
    this._isHiddenEditText = true;

    // #1 Shape 아이템 변수 찾아옴
    let shapeItem:EditableShape = this.layerService.getWhiteboardItem(firedPointText.parent) as EditableShape;

    let adjustedContent = this.getAdjustedTextContent(
      this.HTMLTextEditorElement.innerHTML.replace(/<div>([^<>]*)<\/div>/g, "\n$1"),
      this.posCalcService.advConvertLengthNgToPaper(shapeItem.coreItem.bounds.width),
      this.posCalcService.advConvertLengthNgToPaper(shapeItem.coreItem.bounds.height)
    );


    //에디트 텍스트 값 변경
    console.log("ShapeService >> textEditEnd >> adjustedContent : ",adjustedContent);
    //####### 이걸로 ShapeItem의 값도 바꾸고 그쪽 설정도 다시 해줌
    shapeItem.modifyEditText(adjustedContent,this.HTMLTextEditorElement.innerText);

    this.HTMLTextEditorElement.innerText = "";
    //item.data.pointTextId = shapeItem.editTextID;

    document.removeEventListener("mousedown", this.outsideHandler);
    document.removeEventListener("touchstart", this.outsideHandler);
    shapeItem.isEditing = false;
  }

  private getAdjustedTextContent(text: string, width: number, height: number) {
    let calcText = "";
    let charWidth;
    let calcWidth = 0;
    let charHeight;
    let calcHeight = 0;

    width -= this.padding;
    height -= this.padding;

    let textStyle = new TextStyle();

    if(text === "") {
      calcText = "";
    } else {
      let tokenizedText = text.match(/./g);

      charHeight = this.calcStringHeight(tokenizedText[0], textStyle);
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

    return calcText;
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

    points.point = this.posCalcService.advConvertNgToPaper(points.point);
    points.delta = this.posCalcService.reflectZoomWithPoint(points.delta);

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
    //this.setEditable(this.newPath);
    this.createShapeItem();
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
    this.createShapeItem();
    //this.setEditable(this.newPath);
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


  private onClickOutsidePanel(event, element, item) {
    if(element.contains(event.target)) {
      this.textEditEnd(item);
    }
  }

  private calcStringWidth(input: string, style: TextStyle): number {
    let tempPointText = new PointText({
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
    console.log("ShapeService >> calcStringHeight >> style.fontSize : ",style.fontSize);
    let tempPointText = new PointText({
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
