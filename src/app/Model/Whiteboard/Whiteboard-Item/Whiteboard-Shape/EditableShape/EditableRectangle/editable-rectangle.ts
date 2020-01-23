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

export class EditableRectangle extends EditableShape {
  constructor(group, type, item:Item, textStyle, editText, posService, eventEmitter, zoomEventEmitter) {
    super(group, type, item, textStyle, editText, posService, eventEmitter, zoomEventEmitter);

  }
}
