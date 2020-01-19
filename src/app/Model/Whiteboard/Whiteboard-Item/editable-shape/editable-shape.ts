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
import {EventEmitter} from '@angular/core';
import {ItemLifeCycleEnum, ItemLifeCycleEvent} from '../WhiteboardItemLifeCycle/WhiteboardItemLifeCycle';

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
  private _isEditing:boolean;

  protected constructor(group, type, item:Item, textStyle, editText,
                        private posCalcService:PositionCalcService,
                        eventEmitter:EventEmitter<any>) {
    super(group, type, item, eventEmitter);
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
    this.isEditing = false;

    item.onFrame = (event)=>{
      if(event.count % 15 === 0){
        this.editText.position = new Point(this.coreItem.bounds.center);
        if(!this.isEditing){
          editText.bringToFront();
        }
      }
    };//onFrame
  }
  public notifyItemModified(){
    console.log("EditableShape >> notifyItemModified >> 진입함");

    this.width = this.group.bounds.width;
    this.height = this.group.bounds.height;
    this.topLeft  = this.group.bounds.topLeft;

    this.borderColor = this.coreItem.style.strokeColor;
    this.borderWidth = this.coreItem.style.strokeWidth;
    if(this.coreItem.style.fillColor){
      this.fillColor = this.coreItem.style.fillColor;
    }else{
      // @ts-ignore
      this.fillColor = "transparent";
    }
    this.opacity = this.coreItem.opacity;
    this.textBound = new Rectangle(this.editText.bounds);

    this.lifeCycleEventEmitter.emit(new ItemLifeCycleEvent(this.id, this, ItemLifeCycleEnum.MODIFY));
  }
  public notifyItemCreation() {
    console.log("EditableShape >> createItem >> 진입함");
    this.lifeCycleEventEmitter.emit(new ItemLifeCycleEvent(this.id, this, ItemLifeCycleEnum.CREATE));
  }

  public destroyItem() {
    console.log("EditableShape >> destroyItem >> 진입함");
    this.editText.remove();
    this.coreItem.remove();
    this.group.remove();
    this.lifeCycleEventEmitter.emit(new ItemLifeCycleEvent(this.id, this, ItemLifeCycleEnum.DESTROY));
  }

  public refreshItem(){
    console.log("EditableShape >> refreshItem >> 진입함");
    let newtopLeft = this.group.bounds.topLeft;

    let newWidth = this.group.bounds.width;
    let newHeight = this.group.bounds.height;

    this.group.matrix.reset();


    this.coreItem.bounds.width = newWidth;
    this.coreItem.bounds.height = newHeight;
    this.coreItem.bounds.topLeft = newtopLeft;

    this.group.addChild(this.editText);
    this.group.addChild(this.coreItem);

    let convertedText = this.rawTextContent.replace(
      /<(div|br)([^>]*)>/g, '\n'  // <div> <br> -> \n
    ).replace(
      /(<([^>]+)>)/ig, ""         // <*> -> empty
    );

    let adjustedTextContent = this.getAdjustedTextContent(
      convertedText,
      this.posCalcService.advConvertLengthNgToPaper(this.coreItem.bounds.width),
      this.posCalcService.advConvertLengthNgToPaper(this.coreItem.bounds.height));

    this.modifyEditText(adjustedTextContent,this.rawTextContent);

    this.editText.bringToFront();
    this.lifeCycleEventEmitter.emit(new ItemLifeCycleEvent(this.id, this, ItemLifeCycleEnum.MODIFY));
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

      charHeight = this.calcStringHeight(text[0], textStyle);
      for(let i = 0; i < text.length; i++) {
        if(text[i] === '\n') {
          calcText += text[i];
          calcHeight += charHeight;
          calcWidth = 0;
          i++;
        }
        charWidth = this.calcStringWidth(text[i], textStyle);
        calcWidth += charWidth;

        if(calcWidth > width) {
          calcHeight += charHeight;
          calcText += '\n';
          calcWidth = charWidth;
        }
        if(calcHeight > height) {
          break;
        }
        calcText += text[i];
      }
    }
    return calcText;
  }
  private calcStringHeight(input: string, style: TextStyle): number {
    let tempPointText = new PointText({
      fontFamily: style.fontFamily,
      fontSize: style.fontSize,
      fontWeight: style.fontWeight,
      content: input,
      fillColor: 'transparent',
    });
    let height = tempPointText.bounds.height;
    tempPointText.remove();

    return this.posCalcService.advConvertLengthNgToPaper(height);
  }
  private calcStringWidth(input: string, style: TextStyle): number {
    let tempPointText = new PointText({
      fontFamily: style.fontFamily,
      fontSize: style.fontSize,
      fontWeight: style.fontWeight,
      content: input,
      fillColor: 'transparent',
    });
    let width = tempPointText.bounds.width;
    tempPointText.remove();

    return this.posCalcService.advConvertLengthNgToPaper(width);
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
