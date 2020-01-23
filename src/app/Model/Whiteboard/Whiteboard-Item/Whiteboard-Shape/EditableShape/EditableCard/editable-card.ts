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
export class EditableCard extends EditableShape {
  private _borderRadius: number;
  private _tagList: Array<any>;    // TODO : 일단 ANY 지만 TAG 형식 지정되면 바꾸기
  constructor(group, type, item:Item, textStyle, editText, posService, eventEmitter, zoomEventEmitter) {
    super(group, type, item, textStyle, editText, posService, eventEmitter, zoomEventEmitter);

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
