import {WhiteboardItemDto} from '../whiteboard-item-dto';

import * as paper from 'paper';
import {GachiPointDto} from '../PointDto/gachi-point-dto';
import {GachiSegmentDto} from "../SegmentDto/gachi-segment-dto";

export class EditableStrokeDto extends WhiteboardItemDto{
  public segments:Array<GachiSegmentDto>;
  public strokeWidth;
  public strokeColor;

  constructor(id, type, center: GachiPointDto, isGrouped, parentEdtGroupId, segments: Array<GachiSegmentDto>, strokeWidth, strokeColor, isLocked) {
    super(id, type, center, isGrouped, parentEdtGroupId, isLocked );
    this.segments = segments;
    this.strokeWidth = strokeWidth;
    this.strokeColor = strokeColor;
  }
}
