import {EditableShapeDto} from '../editable-shape-dto';
import {LinkPortDto} from '../../LinkPortDto/link-port-dto';
import {TextStyle} from '../../../../Pointer/shape-service/text-style';

export class EditableCircleDto extends EditableShapeDto{

  constructor(width, height, borderColor, borderWidth, fillColor, opacity, LinkPortsDto: Array<LinkPortDto>, textContent, rawTextContent, textStyle: TextStyle) {
    super(width, height, borderColor, borderWidth, fillColor, opacity, LinkPortsDto, textContent, rawTextContent, textStyle);
  }
}
