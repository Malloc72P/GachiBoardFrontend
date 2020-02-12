import {WhiteboardShapeDto} from '../whiteboard-shape-dto';
import {TextStyle} from '../../../../Model/Whiteboard/Pointer/shape-service/text-style';
import {LinkPortDto} from '../LinkPortDto/link-port-dto';
import {GachiPointDto} from '../../PointDto/gachi-point-dto';

export class EditableShapeDto extends WhiteboardShapeDto{

  private _textContent;
  private _rawTextContent;
  private _textStyle:TextStyle;


  constructor(id, type, center: GachiPointDto, isGrouped, parentEdtGroupId, width, height, borderColor, borderWidth, fillColor, opacity, linkPortsDto: Array<LinkPortDto>, textContent, rawTextContent, textStyle: TextStyle) {
    super(id, type, center, isGrouped, parentEdtGroupId, width, height, borderColor, borderWidth, fillColor, opacity, linkPortsDto);
    this._textContent = textContent;
    this._rawTextContent = rawTextContent;
    this._textStyle = textStyle;
  }

  get textContent() {
    return this._textContent;
  }

  set textContent(value) {
    this._textContent = value;
  }

  get rawTextContent() {
    return this._rawTextContent;
  }

  set rawTextContent(value) {
    this._rawTextContent = value;
  }

  get textStyle(): TextStyle {
    return this._textStyle;
  }

  set textStyle(value: TextStyle) {
    this._textStyle = value;
  }
}
