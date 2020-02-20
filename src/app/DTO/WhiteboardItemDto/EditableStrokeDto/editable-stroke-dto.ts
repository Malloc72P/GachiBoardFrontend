import {WhiteboardItemDto} from '../whiteboard-item-dto';

import * as paper from 'paper';
import {GachiPointDto} from '../PointDto/gachi-point-dto';
import {GachiSegmentDto} from "../SegmentDto/gachi-segment-dto";

export class EditableStrokeDto extends WhiteboardItemDto{
  private _segments:Array<GachiSegmentDto>;
  private _strokeWidth;
  private _strokeColor;

  constructor(id, type, center: GachiPointDto, isGrouped, parentEdtGroupId, segments: Array<GachiSegmentDto>, strokeWidth, strokeColor) {
    super(id, type, center, isGrouped, parentEdtGroupId);
    this._segments = segments;
    this._strokeWidth = strokeWidth;
    this._strokeColor = strokeColor;
  }

  get segments(): Array<GachiSegmentDto> {
    return this._segments;
  }

  set segments(value: Array<GachiSegmentDto>) {
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
