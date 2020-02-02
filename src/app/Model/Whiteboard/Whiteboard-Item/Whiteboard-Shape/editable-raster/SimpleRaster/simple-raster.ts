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
import {WhiteboardItemType} from '../../../../../Helper/data-type-enum/data-type.enum';
import {EditableRasterDto} from '../../../../WhiteboardItemDto/WhiteboardShapeDto/EditableRasterDto/editable-raster-dto';
import {SimpleRasterDto} from '../../../../WhiteboardItemDto/WhiteboardShapeDto/EditableRasterDto/SimpleRasterDto/simple-raster-dto';
export class SimpleRaster extends EditableRaster{
  constructor(id, item, layerService) {
    super(id, WhiteboardItemType.SIMPLE_RASTER, item, layerService);

  }

  public exportToDto(): SimpleRasterDto {
    return super.exportToDto() as SimpleRasterDto;
  }

}
