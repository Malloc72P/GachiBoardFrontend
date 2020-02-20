import * as paper from 'paper';
// @ts-ignore
import Point = paper.Point;

import {EditableStrokeDto} from '../editable-stroke-dto';
import {GachiPointDto} from '../../PointDto/gachi-point-dto';

export class HighlightStrokeDto extends EditableStrokeDto{
  constructor(id, type, center: GachiPointDto, isGrouped, parentEdtGroupId, segments: Array<GachiPointDto>, strokeWidth, strokeColor) {
    super(id, type, center, isGrouped, parentEdtGroupId, segments, strokeWidth, strokeColor);
  }

}
