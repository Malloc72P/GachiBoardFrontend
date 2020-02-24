import {EventEmitter} from "@angular/core";
import {GachiTextStyleDto} from "../../../../DTO/WhiteboardItemDto/WhiteboardShapeDto/EditableShapeDto/GachiTextStyleDto/gachi-text-style-dto";

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

  private _changeEmitter: EventEmitter<any>;

  constructor(fontFamily?: string, fontSize?: number, fontColor?: string, isBold?: boolean, isItalic?: boolean, horizontalAlign?: Align, verticalAlign?: Align) {
    this._fontFamily = fontFamily ? fontFamily : "sans-serif";
    this._fontSize = fontSize ? fontSize : 12;
    this._fontColor = fontColor ? fontColor : "black";
    this._horizontalAlign = horizontalAlign ? horizontalAlign : Align.CENTER;
    this._verticalAlign = verticalAlign ? verticalAlign : Align.CENTER;
    this._isBold = isBold ? isBold : false;
    this._isItalic = isItalic ? isItalic : false;
  }

  public clone() {
    return new TextStyle(this.fontFamily, this.fontSize, this.fontColor, this.isBold, this.isItalic, this.horizontalAlign, this.verticalAlign);
  }

  public update(style: TextStyle) {
    let changed = false;

    if(this._fontFamily !== style.fontFamily) {
      this._fontFamily = style.fontFamily;
      changed = true;
    }
    if(this._fontSize !== style.fontSize) {
      this._fontSize = style.fontSize;
      changed = true;
    }
    if(this._fontColor !== style.fontColor) {
      this._fontColor = style.fontColor;
      changed = true;
    }
    if(this._horizontalAlign !== style.horizontalAlign) {
      this._horizontalAlign = style.horizontalAlign;
      changed = true;
    }
    if(this._verticalAlign !== style.verticalAlign) {
      this._verticalAlign = style.verticalAlign;
      changed = true;
    }
    if(this._isBold !== style.isBold) {
      this._isBold = style.isBold;
      changed = true;
    }
    if(this._isItalic !== style.isItalic) {
      this._isItalic = style.isItalic;
      changed = true;
    }

    if(changed) this.emitChange();
  }

  private emitChange() {
    if(!!this._changeEmitter) {
      this._changeEmitter.emit();
    }
  }

  set eventEmitter(value: EventEmitter<any>) {
    this._changeEmitter = value;
  }

  get fontFamily() {
    return this._fontFamily;
  }

  set fontFamily(value) {
    this._fontFamily = value;
    this.emitChange();
  }

  get fontSize() {
    return this._fontSize;
  }

  set fontSize(value) {
    this._fontSize = value;
    this.emitChange();
  }

  get fontColor(): string {
    return this._fontColor;
  }

  set fontColor(value: string) {
    this._fontColor = value;
    this.emitChange();
  }

  get isBold(): boolean {
    return this._isBold;
  }

  set isBold(value: boolean) {
    this._isBold = value;
    this.emitChange();
  }

  get isItalic() {
    return this._isItalic;
  }

  set isItalic(value) {
    this._isItalic = value;
    this.emitChange();
  }

  get horizontalAlign() {
    return this._horizontalAlign;
  }

  set horizontalAlign(value) {
    this._horizontalAlign = value;
    this.emitChange();
  }

  get verticalAlign() {
    return this._verticalAlign;
  }

  set verticalAlign(value) {
    this._verticalAlign = value;
    this.emitChange();
  }

  get fontWeight(): string {
    let weight = "";
    this.isBold ? weight += "bold" : null;
    this.isItalic ? weight += " italic" : null;

    return weight;
  }
}
