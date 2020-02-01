import {WhiteboardShapeDto} from '../whiteboard-shape-dto';
import {LinkPortDto} from '../LinkPortDto/link-port-dto';

export class EditableRasterDto extends WhiteboardShapeDto{
  private _imageBlob;

  constructor(width, height, borderColor, borderWidth, fillColor, opacity, LinkPortsDto: Array<LinkPortDto>, imageBlob) {
    super(width, height, borderColor, borderWidth, fillColor, opacity, LinkPortsDto);
    this._imageBlob = imageBlob;
  }

  get imageBlob() {
    return this._imageBlob;
  }

  set imageBlob(value) {
    this._imageBlob = value;
  }
}
