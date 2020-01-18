
import * as paper from 'paper';
// @ts-ignore
import Path = paper.Path;
// @ts-ignore
import Point = paper.Point;
// @ts-ignore
import Item = paper.Item;
// @ts-ignore
import Segment = paper.Segment;
// @ts-ignore
import Color = paper.Color;
import {WhiteboardItem} from '../whiteboard-item';

export abstract class EditableStroke extends WhiteboardItem {
  private _segments: Array<Segment>;
  private _strokeWidth: number;
  private _strokeColor: Color;

  protected constructor(group, type, path:Path){
    super(group, type, path);
    this.segments = path.segments;
    this.strokeWidth = path.strokeWidth;
    this.strokeColor = path.strokeColor
  }

  public refreshItem() {

  }

  get segments(): Array<Segment> {
    return this._segments;
  }

  set segments(value: Array<Segment>) {
    this._segments = value;
  }

  get strokeWidth(): number {
    return this._strokeWidth;
  }

  set strokeWidth(value: number) {
    this._strokeWidth = value;
  }

  get strokeColor(): Color {
    return this._strokeColor;
  }

  set strokeColor(value: Color) {
    this._strokeColor = value;
  }
}
