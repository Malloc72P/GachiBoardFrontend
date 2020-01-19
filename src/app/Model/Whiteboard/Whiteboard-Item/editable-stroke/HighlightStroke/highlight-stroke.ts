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

export class HighlightStroke extends EditableStroke {
  private _opacity: number;
  constructor(group, type, path:Path, eventEmitter:EventEmitter<any>) {
    super(group, type, path, eventEmitter);

  }

  get opacity(): number {
    return this._opacity;
  }

  set opacity(value: number) {
    this._opacity = value;
  }
}
