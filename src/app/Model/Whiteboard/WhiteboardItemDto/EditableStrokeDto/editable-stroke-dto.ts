import {WhiteboardItemDto} from '../whiteboard-item-dto';

import * as paper from 'paper';
// @ts-ignore
import Point = paper.Point;

export class EditableStrokeDto extends WhiteboardItemDto{
  private _segments:Array<Point>;
  private _strokeWidth;
  private _strokeColor;


  constructor(id, group, type, center, segments: Array<Point>, strokeWidth, strokeColor) {
    super(id, group, type, center);
    this._segments = segments;
    this._strokeWidth = strokeWidth;
    this._strokeColor = strokeColor;
  }

  get segments(): Array<Point> {
    return this._segments;
  }

  set segments(value: Array<Point>) {
    this._segments = value;
  }

  get strokeWidth() {
    return this._strokeWidth;
  }

  set strokeWidth(value) {
    this._strokeWidth = value;
  }

  get strokeColor() {
    return this._strokeColor;
  }

  set strokeColor(value) {
    this._strokeColor = value;
  }
}
