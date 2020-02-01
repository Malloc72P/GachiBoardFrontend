import {LinkPortDto} from '../link-port-dto';

export class EditableLinkDto {
  private _fromLinkPortDto:LinkPortDto;
  private _toLinkPortDto:LinkPortDto;
  private _isDashed;
  private _dashLength;

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
