export class TextStyle {
  private _fontFamily: string;
  private _fontSize: number;
  private _fontWeight: string;
  private _isItalic;
  private _isUnderline;

  constructor(fontFamily?: string, fontSize?: number) {
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
}
