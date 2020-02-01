import {LinkPortDto} from '../link-port-dto';

export class EditableLinkDto {
  private _id;
  private _fromLinkPortDto:LinkPortDto;
  private _toLinkPortDto:LinkPortDto;
  private _isDashed;
  private _dashLength;

  constructor(id, fromLinkPortDto: LinkPortDto, toLinkPortDto: LinkPortDto, isDashed, dashLength) {
    this._id = id;
    this._fromLinkPortDto = fromLinkPortDto;
    this._toLinkPortDto = toLinkPortDto;
    this._isDashed = isDashed;
    this._dashLength = dashLength;
  }

  get id() {
    return this._id;
  }

  set id(value) {
    this._id = value;
  }

  get fromLinkPortDto(): LinkPortDto {
    return this._fromLinkPortDto;
  }

  set fromLinkPortDto(value: LinkPortDto) {
    this._fromLinkPortDto = value;
  }

  get toLinkPortDto(): LinkPortDto {
    return this._toLinkPortDto;
  }

  set toLinkPortDto(value: LinkPortDto) {
    this._toLinkPortDto = value;
  }

  get isDashed() {
    return this._isDashed;
  }

  set isDashed(value) {
    this._isDashed = value;
  }

  get dashLength() {
    return this._dashLength;
  }

  set dashLength(value) {
    this._dashLength = value;
  }
}
