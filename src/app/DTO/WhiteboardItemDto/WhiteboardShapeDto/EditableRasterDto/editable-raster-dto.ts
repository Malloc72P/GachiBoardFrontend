import {WhiteboardShapeDto} from '../whiteboard-shape-dto';
import {LinkPortDto} from '../LinkPortDto/link-port-dto';
import {GachiPointDto} from '../../PointDto/gachi-point-dto';

export class EditableRasterDto extends WhiteboardShapeDto{
  private _imageBlob;


  constructor(id, type, center: GachiPointDto, isGrouped, parentEdtGroupId, width, height, borderColor, borderWidth, fillColor, opacity, linkPortsDto: Array<LinkPortDto>, imageBlob) {
    super(id, type, center, isGrouped, parentEdtGroupId, width, height, borderColor, borderWidth, fillColor, opacity, linkPortsDto);
    this._imageBlob = imageBlob;
  }

  get imageBlob() {
    return this._imageBlob;
  }

  set imageBlob(value) {
    this._imageBlob = value;
  }
}
