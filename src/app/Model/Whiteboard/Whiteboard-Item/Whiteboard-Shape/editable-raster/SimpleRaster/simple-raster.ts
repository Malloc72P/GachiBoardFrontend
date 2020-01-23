import {EditableRaster} from '../editable-raster';
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
// @ts-ignore
import Raster = paper.Raster;
import {PositionCalcService} from '../../../../PositionCalc/position-calc.service';
export class SimpleRaster extends EditableRaster{
  constructor(group, type, item:Raster, posService:PositionCalcService,
              eventEmitter, zoomEventEmitter) {
    super(group, type, item, posService, eventEmitter, zoomEventEmitter);

  }

}
