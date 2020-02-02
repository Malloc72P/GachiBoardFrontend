import {EditableShape} from '../editable-shape';
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
import {WhiteboardItemType} from '../../../../../Helper/data-type-enum/data-type.enum';
import {EditableCardDto} from '../../../../WhiteboardItemDto/WhiteboardShapeDto/EditableShapeDto/EditableCardDto/editable-card-dto';
export class EditableCard extends EditableShape {
  private _borderRadius: number;
  private _tagList: Array<any>;    // TODO : 일단 ANY 지만 TAG 형식 지정되면 바꾸기
  constructor(id, item:Item, textStyle, editText, layerService) {
    super(
      id,
      WhiteboardItemType.EDITABLE_CARD,
      item,
      textStyle,
      editText,
      layerService);

  }

  exportToDto(): EditableCardDto {
    let editableCardDto:EditableCardDto = super.exportToDto() as EditableCardDto;
    editableCardDto.borderRadius = null;
    editableCardDto.tagList = null;

    return editableCardDto
  }

  get borderRadius(): number {
    return this._borderRadius;
  }

  set borderRadius(value: number) {
    this._borderRadius = value;
  }

  get tagList(): Array<any> {
    return this._tagList;
  }

  set tagList(value: Array<any>) {
    this._tagList = value;
  }
}
