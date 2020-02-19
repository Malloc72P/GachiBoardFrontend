import {EditableLinkDto} from '../../EditableLinkDto/editable-link-dto';

export class LinkPortDto {
  private _direction;
  private _ownerWbItemId;

  constructor(direction, ownerWbItemId) {
    this._direction = direction;
    this._ownerWbItemId = ownerWbItemId;
  }

  get direction() {
    return this._direction;
  }

  set direction(value) {
    this._direction = value;
  }

  get ownerWbItemId() {
    return this._ownerWbItemId;
  }

  set ownerWbItemId(value) {
    this._ownerWbItemId = value;
  }
}
