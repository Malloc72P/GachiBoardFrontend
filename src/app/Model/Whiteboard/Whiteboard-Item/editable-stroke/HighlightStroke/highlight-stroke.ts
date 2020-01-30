import {EditableStroke} from '../editable-stroke';

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
import {EventEmitter} from '@angular/core';
import {WhiteboardItemType} from '../../../../Helper/data-type-enum/data-type.enum';

export class HighlightStroke extends EditableStroke {
  private _opacity: number;
  constructor(id, path:Path, layerService) {
    super(id, WhiteboardItemType.HIGHLIGHT_STROKE,
            path,
            layerService);

  }

  get opacity(): number {
    return this._opacity;
  }

  set opacity(value: number) {
    this._opacity = value;
  }
}
