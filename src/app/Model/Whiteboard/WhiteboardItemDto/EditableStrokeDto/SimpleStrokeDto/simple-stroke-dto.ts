import {EditableStrokeDto} from '../editable-stroke-dto';
import {GachiPointDto} from '../../PointDto/gachi-point-dto';

export class SimpleStrokeDto extends EditableStrokeDto{


  constructor(id, type, center: GachiPointDto, isGrouped, parentEdtGroupId, segments: Array<GachiPointDto>, strokeWidth, strokeColor) {
    super(id, type, center, isGrouped, parentEdtGroupId, segments, strokeWidth, strokeColor);
  }
}
