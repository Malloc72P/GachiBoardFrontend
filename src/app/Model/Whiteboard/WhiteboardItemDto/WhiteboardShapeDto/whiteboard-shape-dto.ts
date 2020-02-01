import {LinkPortDto} from './LinkPortDto/link-port-dto';

export class WhiteboardShapeDto {
  private _width;
  private _height;
  private _borderColor;
  private _borderWidth;
  private _fillColor;
  private _opacity;
  private _LinkPortsDto:Array<LinkPortDto>;


  constructor(width, height, borderColor, borderWidth, fillColor, opacity, LinkPortsDto: Array<LinkPortDto>) {
    this._width = width;
    this._height = height;
    this._borderColor = borderColor;
    this._borderWidth = borderWidth;
    this._fillColor = fillColor;
    this._opacity = opacity;
    this._LinkPortsDto = LinkPortsDto;
  }


  get width() {
    return this._width;
  }

  set width(value) {
    this._width = value;
  }

  get height() {
    return this._height;
  }

  set height(value) {
    this._height = value;
  }

  get borderColor() {
    return this._borderColor;
  }

  set borderColor(value) {
    this._borderColor = value;
  }

  get borderWidth() {
    return this._borderWidth;
  }

  set borderWidth(value) {
    this._borderWidth = value;
  }

  get fillColor() {
    return this._fillColor;
  }

  set fillColor(value) {
    this._fillColor = value;
  }

  get opacity() {
    return this._opacity;
  }

  set opacity(value) {
    this._opacity = value;
  }

  get LinkPortsDto(): Array<LinkPortDto> {
    return this._LinkPortsDto;
  }

  set LinkPortsDto(value: Array<LinkPortDto>) {
    this._LinkPortsDto = value;
  }
}
