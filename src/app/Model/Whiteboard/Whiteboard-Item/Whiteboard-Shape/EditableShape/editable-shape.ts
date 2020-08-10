import {TextStyle} from '../../../Pointer/shape-service/text-style';
import {WhiteboardItem} from '../../whiteboard-item';

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
import {ShapeService} from '../../../Pointer/shape-service/shape.service';
import {PositionCalcService} from '../../../PositionCalc/position-calc.service';
import {EventEmitter} from '@angular/core';
import {ItemLifeCycleEnum, ItemLifeCycleEvent} from '../../WhiteboardItemLifeCycle/WhiteboardItemLifeCycle';
import {WhiteboardShape} from '../whiteboard-shape';
import {EditableShapeDto} from '../../../../../DTO/WhiteboardItemDto/WhiteboardShapeDto/EditableShapeDto/editable-shape-dto';
import {GachiTextStyleDto} from "../../../../../DTO/WhiteboardItemDto/WhiteboardShapeDto/EditableShapeDto/GachiTextStyleDto/gachi-text-style-dto";

export abstract class EditableShape extends WhiteboardShape {
  private _rawTextContent: string;
  private _textStyle: TextStyle;
  private _editText: PointText;
  private static readonly EDIT_TEXT_PADDING = 5;
  private _isEditing: boolean;
  private editTextEvent = new EventEmitter();

  protected constructor(id, type, item: Item, textStyle, editText, layerService) {
    super(id, type, item, layerService);

    this.editText = editText;
    this.editText.justification = 'center';
    this._rawTextContent = '';

    this.layerService = layerService;
    this.isEditing = false;

    this._textStyle = textStyle;
    this._textStyle.eventEmitter = this.editTextEvent;
    this.editTextEvent.subscribe(() => {
      this.refreshItem();
      // this.layerService.setEditorTextStyle(this._textStyle);
    });
    this.localLifeCycleEmitter.subscribe((event: ItemLifeCycleEvent) => {
      switch (event.action) {
        case ItemLifeCycleEnum.RESIZED:
          this.refreshItem();
          // this.layerService.setEditorTextStyle(this._textStyle);
          break;
      }
    });
    this.localEmitCreate();
    this.globalEmitCreate();
  }
  public destroyItem() {
    super.destroyItem();
    this.editText.remove();
    this.coreItem.remove();
    this.group.remove();
  }
  public destroyItemAndNoEmit() {
    this.layerService.deleteItemFromWbArray(this.id);
    // super.destroyItem();
    this.editText.remove();
    this.coreItem.remove();
    this.group.remove();
    this.destroyBlind();
    this.localEmitDestroy();
  }

  public refreshItem() {
    let newTopLeft = new Point(this.group.bounds.topLeft.x, this.group.bounds.topLeft.y);

    let newWidth = this.group.bounds.width;
    let newHeight = this.group.bounds.height;

    this.group.matrix.reset();
    this.editText.matrix.reset();

    this.coreItem.bounds.width = newWidth;
    this.coreItem.bounds.height = newHeight;
    this.coreItem.bounds.topLeft = newTopLeft;

    this.group.addChild(this.editText);
    this.group.addChild(this.coreItem);


    let convertedText = this.rawTextContent.replace(
      /<(div|br)([^>]*)>/g, '\n'  // <div> <br> -> \n
    ).replace(
      /(<([^>]+)>)/ig, ''         // <*> -> empty
    );

    let adjustedTextContent = this.getAdjustedTextContent(
      convertedText,
      this.layerService.posCalcService.advConvertLengthNgToPaper(this.coreItem.bounds.width),
      this.layerService.posCalcService.advConvertLengthNgToPaper(this.coreItem.bounds.height),
      this.textStyle
    );

    this.modifyEditText(adjustedTextContent);

    if(!this.layerService.isEditingText) {
      this.editText.bringToFront();
    }
  }

  public modifyEditText(content) {

    this.textContent = content;

    this.editText.content = this.textContent;
    this.editText.position = this.coreItem.bounds.center;

    this.editText.fontFamily = this.textStyle.fontFamily;
    this.editText.fontSize = this.textStyle.fontSize;
    this.editText.fontWeight = this.textStyle.fontWeight;
    this.editText.fillColor = new Color(this.textStyle.fontColor);

    this.editText.bringToFront();
  }

  private getAdjustedTextContent(text: string, width: number, height: number, textStyle: TextStyle) {
    let calcText = '';
    let charWidth;
    let calcWidth = 0;
    let charHeight;
    let calcHeight = 0;

    width -= EditableShape.EDIT_TEXT_PADDING * 2;
    height -= EditableShape.EDIT_TEXT_PADDING * 2;

    if (text === '') {
      calcText = '';
    } else {
      charHeight = this.calcStringHeight(text[0], textStyle);
      calcHeight += charHeight;
      for (let i = 0; i < text.length; i++) {
        if (text[i] === '\n') {
          calcHeight += charHeight;
          if(calcHeight > height) {
            break;
          }
          calcText += text[i];
          calcWidth = 0;
          i++;
        }
        charWidth = this.calcStringWidth(text[i], textStyle);
        calcWidth += charWidth;

        if (calcWidth > width) {
          calcHeight += charHeight;
          if (calcHeight > height) {
            break;
          }
          calcText += '\n';
          calcWidth = charWidth;
        }
        if(!!text[i]) {
          calcText += text[i];
        }
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

    return this.layerService.posCalcService.advConvertLengthNgToPaper(height);
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

    return this.layerService.posCalcService.advConvertLengthNgToPaper(width);
  }

  public update(dto: EditableShapeDto) {
    super.update(dto);

    this.textContent = dto.textContent;
    this.rawTextContent = dto.rawTextContent;
    this.textStyle = GachiTextStyleDto.getTextStyle(dto.textStyle);
  }

  exportToDto(): EditableShapeDto {
    let editableShapeDto:EditableShapeDto =  super.exportToDto() as EditableShapeDto;

    editableShapeDto.textContent = this.textContent;
    editableShapeDto.rawTextContent = this.rawTextContent;
    editableShapeDto.textStyle = GachiTextStyleDto.create(this.textStyle);

    return editableShapeDto;
  }

  get textContent(): string {
    return this.editText.content;
  }

  set textContent(value: string) {
    this.editText.content = value;
  }

  get rawTextContent(): string {
    return this._rawTextContent;
  }

  set rawTextContent(value: string) {
    this._rawTextContent = value;
    this.editTextEvent.emit();
  }

  get textStyle(): TextStyle {
    return this._textStyle;
  }

  set textStyle(value: TextStyle) {
    this._textStyle.update(value);
  }

  get textBound(): paper.Rectangle {
    return this.editText.bounds;
  }

  get editText(): paper.PointText {
    return this._editText;
  }

  set editText(value: paper.PointText) {
    this._editText = value;
  }

  get isEditing(): boolean {
    return this._isEditing;
  }

  set isEditing(value: boolean) {
    this._isEditing = value;
  }
}
