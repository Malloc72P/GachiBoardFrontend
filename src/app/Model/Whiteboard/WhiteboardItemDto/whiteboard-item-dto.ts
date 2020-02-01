export class WhiteboardItemDto {
  private _id;
  private _group;
  private _type;
  private _center;

  constructor(id, group, type, center) {
    this._id = id;
    this._group = group;
    this._type = type;
    this._center = center;
  }

  get id() {
    return this._id;
  }

  set id(value) {
    this._id = value;
  }

  get group() {
    return this._group;
  }

  set group(value) {
    this._group = value;
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
