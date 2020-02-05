export enum Align {
  LEFT,
  CENTER,
  RIGHT,
}

export class TextStyle {
  private _fontFamily: string;
  private _fontSize: number;
  private _fontWeight: string;
  private _fontColor: string;
  private _isItalic;
  private _isUnderline;
  private _horizontalAlign: Align;
  private _verticalAlign: Align;

  constructor(fontFamily?: string, fontSize?: number, horizontalAlign?: Align, verticalAlign?: Align) {
    if(fontFamily) {
      this._fontFamily = fontFamily;
    } else {
      this._fontFamily = "sans-serif";
    }
    if(fontSize) {
      this._fontSize = fontSize;
    } else {
      this._fontSize = 12;
    }
    if(horizontalAlign) {
      this._horizontalAlign = horizontalAlign;
    } else {
      this._horizontalAlign = Align.CENTER;
    }
    if(verticalAlign) {
      this._verticalAlign = verticalAlign;
    } else {
      this._verticalAlign = Align.CENTER;
    }
    this._fontWeight = 'normal';
    this._isItalic = false;
    this._isUnderline = false;
  }

  get fontFamily() {
    return this._fontFamily;
  }

  set fontFamily(value) {
    this._fontFamily = value;
  }

  get fontSize() {
    return this._fontSize;
  }

  set fontSize(value) {
    this._fontSize = value;
  }

  get fontColor(): string {
    return this._fontColor;
  }

  set fontColor(value: string) {
    this._fontColor = value;
  }

  get fontWeight() {
    return this._fontWeight;
  }

  set fontWeight(value) {
    this._fontWeight = value;
  }

  get isItalic() {
    return this._isItalic;
  }

  set isItalic(value) {
    this._isItalic = value;
  }

  get isUnderline() {
    return this._isUnderline;
  }

  set isUnderline(value) {
    this._isUnderline = value;
  }

  get horizontalAlign() {
    return this._horizontalAlign;
  }

  set horizontalAlign(value) {
    this._horizontalAlign = value;
  }

  get verticalAlign() {
    return this._verticalAlign;
  }

  set verticalAlign(value) {
    this._verticalAlign = value;
  }
}
