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
export class EditableCircle extends EditableShape {
  private _radius: number;
  constructor(item:Item, textStyle, editText, posService, eventEmitter, zoomEventEmitter) {
    super(
      WhiteboardItemType.EDITABLE_CIRCLE,
      item,
      textStyle,
      editText,
      posService,
      eventEmitter,
      zoomEventEmitter);

  }


  get radius(): number {
    return this._radius;
  }

  set radius(value: number) {
    this._radius = value;
  }
}
