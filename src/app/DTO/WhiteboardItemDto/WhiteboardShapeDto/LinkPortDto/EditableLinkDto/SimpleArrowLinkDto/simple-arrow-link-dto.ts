import {EditableLinkDto} from '../editable-link-dto';
import {GachiColorDto} from '../../../../ColorDto/gachi-color-dto';
import {GachiPointDto} from '../../../../PointDto/gachi-point-dto';
import {WhiteboardItemType} from '../../../../../../Model/Helper/data-type-enum/data-type.enum';

export class SimpleArrowLinkDto extends EditableLinkDto{
  private _normalizeFactor;

  constructor(id, type, fromLinkPortId, fromLinkPortDirection, toLinkPortId, toLinkPortDirection, isDashed, dashLength, strokeColor: GachiColorDto, strokeWidth, fillColor: GachiColorDto, midPoints: Array<GachiPointDto>, normalizeFactor) {
    super(id, type, fromLinkPortId, fromLinkPortDirection, toLinkPortId, toLinkPortDirection, isDashed, dashLength, strokeColor, strokeWidth, fillColor, midPoints);
    this._normalizeFactor = normalizeFactor;
  }

  get normalizeFactor() {
    return this._normalizeFactor;
  }

  set normalizeFactor(value) {
    this._normalizeFactor = value;
  }
}
