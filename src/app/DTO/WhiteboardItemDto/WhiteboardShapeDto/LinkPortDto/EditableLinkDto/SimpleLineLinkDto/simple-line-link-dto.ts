import {EditableLinkDto} from '../editable-link-dto';
import {GachiColorDto} from '../../../../ColorDto/gachi-color-dto';
import {GachiPointDto} from '../../../../PointDto/gachi-point-dto';
import {WhiteboardItemType} from '../../../../../../Model/Helper/data-type-enum/data-type.enum';

export class SimpleLineLinkDto extends EditableLinkDto{

  constructor(id, type, fromLinkPortId, fromLinkPortDirection, toLinkPortId, toLinkPortDirection, isDashed, dashLength, strokeColor: GachiColorDto, strokeWidth, fillColor: GachiColorDto, midPoints: Array<GachiPointDto>) {
    super(id, type, fromLinkPortId, fromLinkPortDirection, toLinkPortId, toLinkPortDirection, isDashed, dashLength, strokeColor, strokeWidth, fillColor, midPoints);
  }
}
