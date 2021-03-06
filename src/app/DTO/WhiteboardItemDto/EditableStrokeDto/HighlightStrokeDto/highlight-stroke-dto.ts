import * as paper from 'paper';
// @ts-ignore
import Point = paper.Point;

import {EditableStrokeDto} from '../editable-stroke-dto';
import {GachiPointDto} from '../../PointDto/gachi-point-dto';
import {GachiSegmentDto} from "../../SegmentDto/gachi-segment-dto";

export class HighlightStrokeDto extends EditableStrokeDto{
  constructor(id, type, center: GachiPointDto, isGrouped, parentEdtGroupId, segments: Array<GachiSegmentDto>, strokeWidth, strokeColor, isLocked) {
    super(id, type, center, isGrouped, parentEdtGroupId, segments, strokeWidth, strokeColor, isLocked);
  }
}
