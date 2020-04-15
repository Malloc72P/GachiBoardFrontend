import {LinkPortDto} from './LinkPortDto/link-port-dto';
import {WhiteboardItemDto} from '../whiteboard-item-dto';
import {GachiPointDto} from '../PointDto/gachi-point-dto';

export class WhiteboardShapeDto extends WhiteboardItemDto{
  public width;
  public height;
  public borderColor;
  public borderWidth;
  public fillColor;
  public opacity;
  public linkPortsDto:Array<LinkPortDto>;


  constructor(id, type, center: GachiPointDto, isGrouped, parentEdtGroupId, width, height, borderColor, borderWidth, fillColor, opacity, linkPortsDto: Array<LinkPortDto>, isLocked) {
    super(id, type, center, isGrouped, parentEdtGroupId, isLocked);
    this.width = width;
    this.height = height;
    this.borderColor = borderColor;
    this.borderWidth = borderWidth;
    this.fillColor = fillColor;
    this.opacity = opacity;
    this.linkPortsDto = linkPortsDto;
  }
}
