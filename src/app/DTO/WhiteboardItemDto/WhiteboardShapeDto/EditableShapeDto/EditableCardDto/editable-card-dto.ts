import {EditableShapeDto} from '../editable-shape-dto';
import {LinkPortDto} from '../../LinkPortDto/link-port-dto';
import {TextStyle} from '../../../../../Model/Whiteboard/Pointer/shape-service/text-style';
import {GachiPointDto} from '../../../PointDto/gachi-point-dto';

export class EditableCardDto extends EditableShapeDto{
  public borderRadius: number;
  public tagList: Array<any>;


  constructor(id, type, center: GachiPointDto, isGrouped, parentEdtGroupId, width, height, borderColor, borderWidth, fillColor, opacity, linkPortsDto: Array<LinkPortDto>, textContent, rawTextContent, textStyle: TextStyle, borderRadius: number, tagList: Array<any>) {
    super(id, type, center, isGrouped, parentEdtGroupId, width, height, borderColor, borderWidth, fillColor, opacity, linkPortsDto, textContent, rawTextContent, textStyle);
    this.borderRadius = borderRadius;
    this.tagList = tagList;
  }
}
