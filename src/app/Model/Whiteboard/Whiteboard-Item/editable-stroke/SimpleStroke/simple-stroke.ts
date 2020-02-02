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
import {EditableStrokeDto} from '../../../WhiteboardItemDto/EditableStrokeDto/editable-stroke-dto';
import {SimpleStrokeDto} from '../../../WhiteboardItemDto/EditableStrokeDto/SimpleStrokeDto/simple-stroke-dto';

export class SimpleStroke extends EditableStroke {
  constructor(id, path:Path, layerService) {
    super(id, WhiteboardItemType.SIMPLE_STROKE,
      path,
      layerService);
  }

  public exportToDto(): SimpleStrokeDto {
    return super.exportToDto() as SimpleStrokeDto;
  }

}
