import {EditableShapeDto} from '../editable-shape-dto';
import {LinkPortDto} from '../../LinkPortDto/link-port-dto';
import {TextStyle} from '../../../../../Model/Whiteboard/Pointer/shape-service/text-style';
import {GachiPointDto} from '../../../PointDto/gachi-point-dto';

export class EditableCardDto extends EditableShapeDto{
  private _borderRadius: number;
  private _tagList: Array<any>;


  constructor(id, type, center: GachiPointDto, isGrouped, parentEdtGroupId, width, height, borderColor, borderWidth, fillColor, opacity, linkPortsDto: Array<LinkPortDto>, textContent, rawTextContent, textStyle: TextStyle, borderRadius: number, tagList: Array<any>) {
    super(id, type, center, isGrouped, parentEdtGroupId, width, height, borderColor, borderWidth, fillColor, opacity, linkPortsDto, textContent, rawTextContent, textStyle);
    this._borderRadius = borderRadius;
    this._tagList = tagList;
  }

  get borderRadius(): number {
    return this._borderRadius;
  }

  set borderRadius(value: number) {
    this._borderRadius = value;
  }

  get tagList(): Array<any> {
    return this._tagList;
  }

  set tagList(value: Array<any>) {
    this._tagList = value;
  }
}
