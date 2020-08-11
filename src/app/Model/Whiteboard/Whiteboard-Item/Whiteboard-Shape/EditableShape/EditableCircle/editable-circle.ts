import {EditableShape} from '../editable-shape';
import * as paper from 'paper';
// @ts-ignore
import Path = paper.Path;
// @ts-ignore
import Point = paper.Point;
// @ts-ignore
import Item = paper.Item;
// @ts-ignore
import Size = paper.Size;
// @ts-ignore
import Rectangle = paper.Rectangle;
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

  public update(dto: EditableCircleDto) {
    super.update(dto);

  }

  get radius(): number {
    return this._radius;
  }

  set radius(value: number) {
    this._radius = value;
    let center = this.coreItem.position;
    this.coreItem.bounds = new Rectangle(this.topLeft, new Size(value * 2, value * 2));
    this.coreItem.position = center;
  }
}
