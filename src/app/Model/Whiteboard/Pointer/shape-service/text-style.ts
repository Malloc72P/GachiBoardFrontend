import {EventEmitter} from "@angular/core";

export enum Align {
  LEFT,
  CENTER,
  RIGHT,
}

export class TextStyle {
  private _fontFamily: string;
  private _fontSize: number;
  private _fontColor: string;
  private _isItalic: boolean;
  private _isBold: boolean;
  private _horizontalAlign: Align;
  private _verticalAlign: Align;
  private readonly _changeEmitter: EventEmitter<any>;

  constructor(fontFamily?: string, fontSize?: number, fontColor?: string, isBold?: boolean, isItalic?: boolean, horizontalAlign?: Align, verticalAlign?: Align) {
    this._changeEmitter = new EventEmitter<any>();
    this.fontFamily = fontFamily ? fontFamily : "sans-serif";
    this.fontSize = fontSize ? fontSize : 12;
    this.fontColor = fontColor ? fontColor : "black";
    this.horizontalAlign = horizontalAlign ? horizontalAlign : Align.CENTER;
    this.verticalAlign = verticalAlign ? verticalAlign : Align.CENTER;
    this.isBold = isBold ? isBold : false;
    this.isItalic = isItalic ? isItalic : false;
  }

  public clone() {
    return new TextStyle(this.fontFamily, this.fontSize, this.fontColor, this.isBold, this.isItalic, this.horizontalAlign, this.verticalAlign);
  }

  get fontFamily() {
    return this._fontFamily;
  }

  set fontFamily(value) {
    this._fontFamily = value;
    this._changeEmitter.emit();
  }

  get fontSize() {
    return this._fontSize;
  }

  set fontSize(value) {
    this._fontSize = value;
    this._changeEmitter.emit();
  }

  get fontColor(): string {
    return this._fontColor;
  }

  set fontColor(value: string) {
    this._fontColor = value;
    this._changeEmitter.emit();
  }

  get isBold(): boolean {
    return this._isBold;
  }

  set isBold(value: boolean) {
    this._isBold = value;
    this._changeEmitter.emit();
  }

  get isItalic() {
    return this._isItalic;
  }

  set isItalic(value) {
    this._isItalic = value;
    this._changeEmitter.emit();
  }

  get horizontalAlign() {
    return this._horizontalAlign;
  }

  set horizontalAlign(value) {
    this._horizontalAlign = value;
    this._changeEmitter.emit();
  }

  get verticalAlign() {
    return this._verticalAlign;
  }

  set verticalAlign(value) {
    this._verticalAlign = value;
    this._changeEmitter.emit();
  }

  get fontWeight(): string {
    let weight = "";
    this.isBold ? weight += "bold" : null;
    this.isItalic ? weight += " italic" : null;

    return weight;
  }

  get changed(): EventEmitter<any> {
    return this._changeEmitter;
  }
}
