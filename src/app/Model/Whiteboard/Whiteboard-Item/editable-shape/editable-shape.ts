import {TextStyle} from "../../Pointer/shape-service/text-style";
import {WhiteboardItem} from '../whiteboard-item';

import * as paper from 'paper';
// @ts-ignore
import Path = paper.Path;
// @ts-ignore
import Point = paper.Point;
// @ts-ignore
import Item = paper.Item;
// @ts-ignore
import Segment = paper.Segment;
// @ts-ignore
import Color = paper.Color;
// @ts-ignore
import PointText = paper.PointText;
// @ts-ignore
import Group = paper.Group;
// @ts-ignore
import Rectangle = paper.Rectangle;
import {ShapeService} from '../../Pointer/shape-service/shape.service';
import {PositionCalcService} from '../../PositionCalc/position-calc.service';

export abstract class EditableShape extends WhiteboardItem {

  private _width: number;
  private _height: number;
  private _borderColor;
  private _borderWidth: number;
  private _fillColor: paper.Color;
  private _opacity: number;
  private _textContent: string;
  private _rawTextContent: string;
  private _textStyle: TextStyle;
  private _textBound: Rectangle;
  private _editText:PointText;
  private static readonly EDIT_TEXT_PADDING = 5;
  private _isEditing:boolean = false;

  protected constructor(group, type, item:Item, textStyle, editText,
  private posCalcService:PositionCalcService) {
    super(group, type, item);
    this.topLeft  = item.bounds.topLeft;
    this.width    = item.bounds.width;
    this.height    = item.bounds.height;
    this.borderColor = item.style.strokeColor;
    this.borderWidth = item.style.strokeWidth;
    if(item.style.fillColor){
      this.fillColor = item.style.fillColor;
    }else{
      // @ts-ignore
      this.fillColor = "transparent";
    }
    this.opacity = item.opacity;
    this.textStyle = textStyle;
    this.textContent = "";
    this.rawTextContent = "";

    this.editText = editText;
    this.textBound = new Rectangle(editText.bounds);
    this.editText.justification = "center";
    this.posCalcService = posCalcService;
  }

  public refreshItem(){
    console.log("EditableShape >> refreshItem >> 진입함");
    let newtopLeft = this.group.bounds.topLeft;

    let newWidth = this.group.bounds.width;
    let newHeight = this.group.bounds.height;

    this.group.matrix.reset();

    // this.editText.bounds.width = this.textBound.width;
    // this.editText.bounds.height = this.textBound.height;
    // this.editText.bounds.topLeft = newtopLeft;


    this.coreItem.bounds.width = newWidth;
    this.coreItem.bounds.height = newHeight;
    this.coreItem.bounds.topLeft = newtopLeft;

    this.group.addChild(this.editText);
    this.group.addChild(this.coreItem);

    console.log("EditableShape >> refreshItem >> this.editText.bounds.width : ",this.editText.bounds.width);
    console.log("EditableShape >> refreshItem >> this.coreItem.bounds.width : ",this.coreItem.bounds.width);

    let adjustedTextContent = this.getAdjustedTextContent(
      this.rawTextContent.replace(/<div>([^<>]*)<\/div>/g, "\n$1"),
      this.posCalcService.advConvertLengthNgToPaper(this.coreItem.bounds.width),
      this.posCalcService.advConvertLengthNgToPaper(this.coreItem.bounds.height));

    this.modifyEditText(adjustedTextContent,this.rawTextContent);

    this.editText.bringToFront();
  }

  public modifyEditText(content, rawContent ){
    this.textContent = content;
    this.rawTextContent = rawContent;

    this.editText.content = this.textContent;
    this.editText.position = this.coreItem.bounds.center;

    this.editText.fontFamily = this.textStyle.fontFamily;
    this.editText.fontSize = this.textStyle.fontSize;
    this.editText.fontWeight = this.textStyle.fontWeight;

    this.textBound = new Rectangle(this.editText.bounds);

    this.editText.bringToFront();
  }

  private getAdjustedTextContent(text: string, width: number, height: number) {
    let calcText = "";
    let charWidth;
    let calcWidth = 0;
    let charHeight;
    let calcHeight = 0;

    width -= EditableShape.EDIT_TEXT_PADDING;
    height -= EditableShape.EDIT_TEXT_PADDING;

    let textStyle = new TextStyle();

    if(text === "") {
      calcText = "";
    } else {
      let tokenizedText = text.match(/./g);

      charHeight = EditableShape.calcStringHeight(tokenizedText[0], textStyle);
      for(let i = 0; i < tokenizedText.length; i++) {
        charWidth = EditableShape.calcStringWidth(tokenizedText[i], textStyle);

        calcWidth += charWidth;

        if(calcWidth > width) {
          calcHeight += charHeight;
          if(calcHeight > height) {
            break;
          }

          calcText += '\n';
          calcWidth = charWidth;
        }

        calcText += tokenizedText[i];
      }
    }
    return calcText;
  }
  private static calcStringHeight(input: string, style: TextStyle): number {
    console.log("ShapeService >> calcStringHeight >> style.fontSize : ",style.fontSize);
    let tempPointText = new PointText({
      fontFamily: style.fontFamily,
      fontSize: style.fontSize,
      fontWeight: style.fontWeight,
      content: input,
      fillColor: 'transparent',
    });
    let height = tempPointText.bounds.height;
    tempPointText.remove();

    return height;
  }
  private static calcStringWidth(input: string, style: TextStyle): number {
    let tempPointText = new PointText({
      fontFamily: style.fontFamily,
      fontSize: style.fontSize,
      fontWeight: style.fontWeight,
      content: input,
      fillColor: 'transparent',
    });
    let width = tempPointText.bounds.width;
    tempPointText.remove();

    return width;
  }


  get isEditing(): boolean {
    return this._isEditing;
  }

  set isEditing(value: boolean) {
    this._isEditing = value;
  }

  get editText() {
    return this._editText;
  }

  set editText(value) {
    this._editText = value;
  }


  get width(): number {
    return this._width;
  }

  set width(value: number) {
    this._width = value;
  }

  get height(): number {
    return this._height;
  }

  set height(value: number) {
    this._height = value;
  }

  get borderColor() {
    return this._borderColor;
  }

  set borderColor(value) {
    this._borderColor = value;
  }

  get borderWidth(): number {
    return this._borderWidth;
  }

  set borderWidth(value: number) {
    this._borderWidth = value;
  }

  get fillColor(): paper.Color {
    return this._fillColor;
  }

  set fillColor(value: paper.Color) {
    this._fillColor = value;
  }

  get opacity(): number {
    return this._opacity;
  }

  set opacity(value: number) {
    this._opacity = value;
  }

  get textContent(): string {
    return this._textContent;
  }

  set textContent(value: string) {
    console.log("EditableShape >> textContent >> value : ",value);
    if (this.editText) {
      this.textBound = new Rectangle(this.editText.bounds);
    }
    this._textContent = value;
  }

  get rawTextContent(): string {
    return this._rawTextContent;
  }

  set rawTextContent(value: string) {
    this._rawTextContent = value;
  }

  get textStyle(): TextStyle {
    return this._textStyle;
  }

  set textStyle(value: TextStyle) {
    this._textStyle = value;
  }

  get textBound(): paper.Rectangle {
    return this._textBound;
  }

  set textBound(value: paper.Rectangle) {
    this._textBound = value;
  }
}
