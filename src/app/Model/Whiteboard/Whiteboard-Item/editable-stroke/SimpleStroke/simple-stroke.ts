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

export class SimpleStroke extends EditableStroke {
  constructor(path:Path, posCalcService,
              eventEmitter:EventEmitter<any>,
              zoomEventEmitter:EventEmitter<any>) {
    super(WhiteboardItemType.SIMPLE_STROKE,
      path,
      posCalcService,
      eventEmitter,
      zoomEventEmitter);

  }

}
