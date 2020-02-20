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
import {EditableCircleDto} from '../../../../../../DTO/WhiteboardItemDto/WhiteboardShapeDto/EditableShapeDto/EditableCircleDto/editable-circle-dto';
export class EditableCircle extends EditableShape {
  private _radius: number;
  constructor(id, item:Item, textStyle, editText, layerService) {
    super(
      id,
      WhiteboardItemType.EDITABLE_CIRCLE,
      item,
      textStyle,
      editText,
      layerService);

  }

  exportToDto(): EditableCircleDto {
    let editableCircleDto:EditableCircleDto = super.exportToDto() as EditableCircleDto;
    editableCircleDto.radius = this.radius;

    return editableCircleDto;
  }


  get radius(): number {
    return this._radius;
  }

  set radius(value: number) {
    this._radius = value;
  }
}
