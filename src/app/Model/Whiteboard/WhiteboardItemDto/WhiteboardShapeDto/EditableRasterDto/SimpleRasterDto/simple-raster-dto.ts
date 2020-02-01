import {EditableRasterDto} from '../editable-raster-dto';
import {LinkPortDto} from '../../LinkPortDto/link-port-dto';

export class SimpleRasterDto extends EditableRasterDto{

  constructor(width, height, borderColor, borderWidth, fillColor, opacity, LinkPortsDto: Array<LinkPortDto>, imageBlob) {
    super(width, height, borderColor, borderWidth, fillColor, opacity, LinkPortsDto, imageBlob);
  }
}
