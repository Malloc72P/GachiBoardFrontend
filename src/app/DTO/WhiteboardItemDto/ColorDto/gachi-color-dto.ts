import * as paper from 'paper';
// @ts-ignore
import Color = paper.Color;

export class GachiColorDto {
  private _red;
  private _green;
  private _blue;
  private _alpha;

  constructor(red, green, blue, alpha?) {
    this._red = red;
    this._green = green;
    this._blue = blue;
    if(alpha){
      this._alpha = alpha;
    }else{
      this._alpha = 1;
    }
  }

  public setColorByPaperColor(color:Color){
    this._red   = color.red;
    this._green = color.green;
    this._blue  = color.blue;
    this._alpha = color.alpha;
  }

  public static createColor(color:Color){
    if(!color){
      return new GachiColorDto(0,0,0,1);
    }
    return new GachiColorDto(
      color.red, color.green, color.blue, color.alpha
    );
  }

  get red() {
    return this._red;
  }

  set red(value) {
    this._red = value;
  }

  get green() {
    return this._green;
  }

  set green(value) {
    this._green = value;
  }

  get blue() {
    return this._blue;
  }

  set blue(value) {
    this._blue = value;
  }

  get alpha() {
    return this._alpha;
  }

  set alpha(value) {
    this._alpha = value;
  }
}
