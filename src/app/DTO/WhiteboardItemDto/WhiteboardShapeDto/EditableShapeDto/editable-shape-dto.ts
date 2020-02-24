import {WhiteboardShapeDto} from '../whiteboard-shape-dto';
import {TextStyle} from '../../../../Model/Whiteboard/Pointer/shape-service/text-style';
import {LinkPortDto} from '../LinkPortDto/link-port-dto';
import {GachiPointDto} from '../../PointDto/gachi-point-dto';

export class EditableShapeDto extends WhiteboardShapeDto{

  public textContent;
  public rawTextContent;
  public textStyle:TextStyle;


  constructor(id, type, center: GachiPointDto, isGrouped, parentEdtGroupId, width, height, borderColor, borderWidth, fillColor, opacity, linkPortsDto: Array<LinkPortDto>, textContent, rawTextContent, textStyle: TextStyle) {
    super(id, type, center, isGrouped, parentEdtGroupId, width, height, borderColor, borderWidth, fillColor, opacity, linkPortsDto);
    this.textContent = textContent;
    this.rawTextContent = rawTextContent;
    this.textStyle = textStyle;
  }
}
