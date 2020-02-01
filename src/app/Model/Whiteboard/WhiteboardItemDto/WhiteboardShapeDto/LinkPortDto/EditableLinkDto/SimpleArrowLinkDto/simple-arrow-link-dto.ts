import {EditableLinkDto} from '../editable-link-dto';

export class SimpleArrowLinkDto extends EditableLinkDto{
  private _normalizeFactor;


  constructor(normalizeFactor) {
    super();
    this._normalizeFactor = normalizeFactor;
  }


  get normalizeFactor() {
    return this._normalizeFactor;
  }

  set normalizeFactor(value) {
    this._normalizeFactor = value;
  }
}
