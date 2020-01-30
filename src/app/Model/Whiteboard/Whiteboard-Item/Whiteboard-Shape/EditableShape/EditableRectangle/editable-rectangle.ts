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

export class EditableRectangle extends EditableShape {
  constructor(id, item:Item, textStyle, editText, layerService) {
    super(
      id,
      WhiteboardItemType.EDITABLE_RECTANGLE,
      item,
      textStyle,
      editText,
      layerService);

  }
}
