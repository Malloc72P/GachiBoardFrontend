import {GachiPointDto} from './PointDto/gachi-point-dto';

export class WhiteboardItemDto {
  private _id;
  private _type;
  private _center:GachiPointDto;

  constructor(id, type, center) {
    this._id = id;
    this._type = type;
    this._center = center;
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
}
