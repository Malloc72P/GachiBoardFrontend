import {TextStyle} from "../../Pointer/shape-service/text-style";
import {WhiteboardItem} from '../whiteboard-item';

export abstract class EditableShape extends WhiteboardItem {
  private _topLeft: paper.Point;
  private _width: number;
  private _height: number;
  private _border: number;
  private _borderWidth: number;
  private _fillColor: paper.Color;
  private _opacity: number;
  private _textContent: string;
  private _rawTextContent: string;
  private _textStyle: TextStyle;
  private _textBound: paper.Rectangle;

  get topLeft(): paper.Point {
    return this._topLeft;
  }

  set topLeft(value: paper.Point) {
    this._topLeft = value;
  }

  get width(): number {
    return this._width;
  }

  set width(value: number) {
    this._width = value;
  }

  get height(): number {
    return this._height;
  }

  set height(value: number) {
    this._height = value;
  }

  get border(): number {
    return this._border;
  }

  set border(value: number) {
    this._border = value;
  }

  get borderWidth(): number {
    return this._borderWidth;
  }

  set borderWidth(value: number) {
    this._borderWidth = value;
  }

  get fillColor(): paper.Color {
    return this._fillColor;
  }

  set fillColor(value: paper.Color) {
    this._fillColor = value;
  }

  get opacity(): number {
    return this._opacity;
  }

  set opacity(value: number) {
    this._opacity = value;
  }

  get textContent(): string {
    return this._textContent;
  }

  set textContent(value: string) {
    this._textContent = value;
  }

  get rawTextContent(): string {
    return this._rawTextContent;
  }

  set rawTextContent(value: string) {
    this._rawTextContent = value;
  }

  get textStyle(): TextStyle {
    return this._textStyle;
  }

  set textStyle(value: TextStyle) {
    this._textStyle = value;
  }

  get textBound(): paper.Rectangle {
    return this._textBound;
  }

  set textBound(value: paper.Rectangle) {
    this._textBound = value;
  }
}
