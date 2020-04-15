import {WhiteboardShapeDto} from '../whiteboard-shape-dto';
import {LinkPortDto} from '../LinkPortDto/link-port-dto';
import {GachiPointDto} from '../../PointDto/gachi-point-dto';
import {GachiTextStyleDto} from "./GachiTextStyleDto/gachi-text-style-dto";

export class EditableShapeDto extends WhiteboardShapeDto{

  public textContent;
  public rawTextContent;
  public textStyle: GachiTextStyleDto;


  constructor(id, type, center: GachiPointDto, isGrouped, parentEdtGroupId,
              width, height, borderColor, borderWidth, fillColor, opacity,
              linkPortsDto: Array<LinkPortDto>, textContent, rawTextContent,
              textStyle: GachiTextStyleDto, isLocked) {
    super(id, type, center, isGrouped, parentEdtGroupId,
      width, height, borderColor, borderWidth, fillColor, opacity, linkPortsDto, isLocked);
    this.textContent = textContent;
    this.rawTextContent = rawTextContent;
    this.textStyle = textStyle;
  }
}
