import {EditableLinkDto} from '../../../../../../DTO/WhiteboardItemDto/WhiteboardShapeDto/LinkPortDto/EditableLinkDto/editable-link-dto';
import {WhiteboardShape} from '../../../Whiteboard-Shape/whiteboard-shape';

export class CopiedLinkData {
  private _linkDto:EditableLinkDto;
  private _canICopyThis:boolean;
  private _fromWbItem:WhiteboardShape;
  private _toWbItem:WhiteboardShape;


  constructor(linkDto: EditableLinkDto, fromWbItem: WhiteboardShape, toWbItem: WhiteboardShape) {
    this._linkDto = linkDto;
    this._canICopyThis = false;
    this._fromWbItem = fromWbItem;
    this._toWbItem = toWbItem;
  }
  get linkDto(): EditableLinkDto {
    return this._linkDto;
  }

  set linkDto(value: EditableLinkDto) {
    this._linkDto = value;
  }

  get canICopyThis(): boolean {
    return this._canICopyThis;
  }

  set canICopyThis(value: boolean) {
    this._canICopyThis = value;
  }

  get fromWbItem(): WhiteboardShape {
    return this._fromWbItem;
  }

  set fromWbItem(value: WhiteboardShape) {
    this._fromWbItem = value;
  }

  get toWbItem(): WhiteboardShape {
    return this._toWbItem;
  }

  set toWbItem(value: WhiteboardShape) {
    this._toWbItem = value;
  }
}
