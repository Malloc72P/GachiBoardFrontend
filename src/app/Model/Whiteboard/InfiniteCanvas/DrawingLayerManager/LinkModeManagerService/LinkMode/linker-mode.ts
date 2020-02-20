import {LinkerColorEnum, LinkerStrokeWidthLevelEnum} from './linker-mode-enum.enum';

export class LinkerMode {
  private _mode;
  private _strokeColor;
  private _strokeWidth;
  private _fillColor;

  constructor(mode, strokeColor?, strokeWidth?, fillColor?) {
    strokeColor   = (strokeColor) ? (strokeColor) : (LinkerColorEnum.BLACK);
    strokeWidth   = (strokeWidth) ? (strokeWidth) : (LinkerStrokeWidthLevelEnum.LEVEL_1);
    fillColor     = (fillColor)   ? (fillColor)   : (LinkerColorEnum.BLACK);
    this._mode = mode;
    this._strokeColor = strokeColor;
    this._strokeWidth = strokeWidth;
    this._fillColor = fillColor;
  }

  get mode() {
    return this._mode;
  }

  set mode(value) {
    this._mode = value;
  }

  get strokeColor() {
    return this._strokeColor;
  }

  set strokeColor(value) {
    this._strokeColor = value;
  }

  get strokeWidth() {
    return this._strokeWidth;
  }

  set strokeWidth(value) {
    this._strokeWidth = value;
  }

  get fillColor() {
    return this._fillColor;
  }

  set fillColor(value) {
    this._fillColor = value;
  }
}
