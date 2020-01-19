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

export class SimpleStroke extends EditableStroke {
  constructor(group, type, path:Path, eventEmitter:EventEmitter<any>) {
    super(group, type, path, eventEmitter);

  }

}
