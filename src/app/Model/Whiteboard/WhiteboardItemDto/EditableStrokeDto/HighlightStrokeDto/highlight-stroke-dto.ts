import * as paper from 'paper';
// @ts-ignore
import Point = paper.Point;

import {EditableStrokeDto} from '../editable-stroke-dto';

export class HighlightStrokeDto extends EditableStrokeDto{
  private _opacity;

  constructor(id, group, type, center, segments: Array<Point>, strokeWidth, strokeColor, opacity) {
    super(id, group, type, center, segments, strokeWidth, strokeColor);
    this._opacity = opacity;
  }

  get opacity() {
    return this._opacity;
  }

  set opacity(value) {
    this._opacity = value;
  }
}
