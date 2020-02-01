import {EditableLinkDto} from '../editable-link-dto';
import {LinkPortDto} from '../../link-port-dto';

export class SimpleArrowLinkDto extends EditableLinkDto{
  private _normalizeFactor;


  constructor(id, fromLinkPortDto: LinkPortDto, toLinkPortDto: LinkPortDto, isDashed, dashLength, normalizeFactor) {
    super(id, fromLinkPortDto, toLinkPortDto, isDashed, dashLength);
    this._normalizeFactor = normalizeFactor;
  }

  get normalizeFactor() {
    return this._normalizeFactor;
  }

  set normalizeFactor(value) {
    this._normalizeFactor = value;
  }
}
