import {LinkPortDto} from './LinkPortDto/link-port-dto';
import {WhiteboardItemDto} from '../whiteboard-item-dto';
import {GachiPointDto} from '../PointDto/gachi-point-dto';

export class WhiteboardShapeDto extends WhiteboardItemDto{
  private _width;
  private _height;
  private _borderColor;
  private _borderWidth;
  private _fillColor;
  private _opacity;
  private _linkPortsDto:Array<LinkPortDto>;


  constructor(id, type, center: GachiPointDto, isGrouped, parentEdtGroupId, width, height, borderColor, borderWidth, fillColor, opacity, linkPortsDto: Array<LinkPortDto>) {
    super(id, type, center, isGrouped, parentEdtGroupId);
    this._width = width;
    this._height = height;
    this._borderColor = borderColor;
    this._borderWidth = borderWidth;
    this._fillColor = fillColor;
    this._opacity = opacity;
    this._linkPortsDto = linkPortsDto;
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

  get linkPortsDto(): Array<LinkPortDto> {
    return this._linkPortsDto;
  }

  set linkPortsDto(value: Array<LinkPortDto>) {
    this._linkPortsDto = value;
  }
}
