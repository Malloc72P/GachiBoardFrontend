import * as paper from 'paper';
// @ts-ignore
import Point = paper.Point;

import {EditableStrokeDto} from '../editable-stroke-dto';
import {GachiPointDto} from '../../PointDto/gachi-point-dto';

export class HighlightStrokeDto extends EditableStrokeDto{
  private _opacity;

  constructor(id, type, center, segments: Array<GachiPointDto>, strokeWidth, strokeColor, opacity) {
    super(id, type, center, segments, strokeWidth, strokeColor);
    this._opacity = opacity;
  }

  get opacity() {
    return this._opacity;
  }

  set opacity(value) {
    this._opacity = value;
  }
}
