import {EditableRasterDto} from '../editable-raster-dto';
import {LinkPortDto} from '../../LinkPortDto/link-port-dto';
import {GachiPointDto} from '../../../PointDto/gachi-point-dto';

export class SimpleRasterDto extends EditableRasterDto{

  constructor(id, type, center: GachiPointDto, isGrouped, parentEdtGroupId, width, height, borderColor, borderWidth, fillColor, opacity, linkPortsDto: Array<LinkPortDto>, imageBlob, isLocked) {
    super(id, type, center, isGrouped, parentEdtGroupId, width, height, borderColor, borderWidth, fillColor, opacity, linkPortsDto, imageBlob, isLocked);
  }
}
