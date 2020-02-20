import {EditableLinkDto} from './EditableLinkDto/editable-link-dto';

export class LinkPortDto {
  private _direction;
  private _ownerWbItemId;
  private _fromLinkList:Array<EditableLinkDto>;
  private _toLinkList:Array<EditableLinkDto>;

  constructor(direction, ownerWbItemId, fromLinkList: Array<EditableLinkDto>, toLinkList: Array<EditableLinkDto>) {
    this._direction = direction;
    this._ownerWbItemId = ownerWbItemId;
    this._fromLinkList = fromLinkList;
    this._toLinkList = toLinkList;
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

  get fromLinkList(): Array<EditableLinkDto> {
    return this._fromLinkList;
  }

  set fromLinkList(value: Array<EditableLinkDto>) {
    this._fromLinkList = value;
  }

  get toLinkList(): Array<EditableLinkDto> {
    return this._toLinkList;
  }

  set toLinkList(value: Array<EditableLinkDto>) {
    this._toLinkList = value;
  }
}
