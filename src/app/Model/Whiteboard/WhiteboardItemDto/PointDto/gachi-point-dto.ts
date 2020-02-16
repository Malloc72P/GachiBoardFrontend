export class GachiPointDto {
  private _x;
  private _y;

  constructor(x, y) {
    this._x = x;
    this._y = y;
  }

  public clone(): GachiPointDto {
    return new GachiPointDto(this.x, this.y);
  }

  get x() {
    return this._x;
  }

  set x(value) {
    this._x = value;
  }

  get y() {
    return this._y;
  }

  set y(value) {
    this._y = value;
  }
}
