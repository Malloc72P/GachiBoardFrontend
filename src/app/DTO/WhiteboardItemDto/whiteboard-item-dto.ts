import {GachiPointDto} from './PointDto/gachi-point-dto';

export class WhiteboardItemDto {
  private _id;
  private _type;
  private _center:GachiPointDto;

  private _isGrouped;
  private _parentEdtGroupId;

  constructor(id, type, center: GachiPointDto, isGrouped, parentEdtGroupId) {
    this._id = id;
    this._type = type;
    this._center = center;
    this._isGrouped = isGrouped;
    this._parentEdtGroupId = parentEdtGroupId;
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

  get center() {
    return this._center;
  }

  set center(value) {
    this._center = value;
  }

  get isGrouped() {
    return this._isGrouped;
  }

  set isGrouped(value) {
    this._isGrouped = value;
  }

  get parentEdtGroupId() {
    return this._parentEdtGroupId;
  }

  set parentEdtGroupId(value) {
    this._parentEdtGroupId = value;
  }
}
