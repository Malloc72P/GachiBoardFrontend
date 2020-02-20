import {GachiColorDto} from '../../../ColorDto/gachi-color-dto';
import {GachiPointDto} from '../../../PointDto/gachi-point-dto';

export class EditableLinkDto {
  private _id;
  private _type;
  private _fromLinkPortId;
  private _fromLinkPortDirection;
  private _toLinkPortId;
  private _toLinkPortDirection;
  private _isDashed;
  private _dashLength;
  private _strokeColor:GachiColorDto;
  private _strokeWidth;
  private _fillColor:GachiColorDto;
  private _midPoints:Array<GachiPointDto>;


  constructor(id, type, fromLinkPortId, fromLinkPortDirection, toLinkPortId, toLinkPortDirection, isDashed, dashLength, strokeColor: GachiColorDto, strokeWidth, fillColor: GachiColorDto, midPoints: Array<GachiPointDto>) {
    this._id = id;
    this._type = type;
    this._fromLinkPortId = fromLinkPortId;
    this._fromLinkPortDirection = fromLinkPortDirection;
    this._toLinkPortId = toLinkPortId;
    this._toLinkPortDirection = toLinkPortDirection;
    this._isDashed = isDashed;
    this._dashLength = dashLength;
    this._strokeColor = strokeColor;
    this._strokeWidth = strokeWidth;
    this._fillColor = fillColor;
    this._midPoints = midPoints;
  }

  get id() {
    return this._id;
  }

  set id(value) {
    this._id = value;
  }

  get type() {
    return this._type;
  }

  set type(value) {
    this._type = value;
  }

  get fromLinkPortId() {
    return this._fromLinkPortId;
  }

  set fromLinkPortId(value) {
    this._fromLinkPortId = value;
  }

  get fromLinkPortDirection() {
    return this._fromLinkPortDirection;
  }

  set fromLinkPortDirection(value) {
    this._fromLinkPortDirection = value;
  }

  get toLinkPortId() {
    return this._toLinkPortId;
  }

  set toLinkPortId(value) {
    this._toLinkPortId = value;
  }

  get toLinkPortDirection() {
    return this._toLinkPortDirection;
  }

  set toLinkPortDirection(value) {
    this._toLinkPortDirection = value;
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

  get strokeColor(): GachiColorDto {
    return this._strokeColor;
  }

  set strokeColor(value: GachiColorDto) {
    this._strokeColor = value;
  }

  get strokeWidth() {
    return this._strokeWidth;
  }

  set strokeWidth(value) {
    this._strokeWidth = value;
  }

  get fillColor(): GachiColorDto {
    return this._fillColor;
  }

  set fillColor(value: GachiColorDto) {
    this._fillColor = value;
  }

  get midPoints(): Array<GachiPointDto> {
    return this._midPoints;
  }

  set midPoints(value: Array<GachiPointDto>) {
    this._midPoints = value;
  }
}
