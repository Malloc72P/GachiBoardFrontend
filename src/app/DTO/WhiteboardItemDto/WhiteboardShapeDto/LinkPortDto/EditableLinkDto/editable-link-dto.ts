import * as paper from 'paper';
// @ts-ignore
import Point = paper.Point;
// @ts-ignore
import Color = paper.Color;
import {WhiteboardItemDto} from "../../../whiteboard-item-dto";
import {LinkPortDto} from "../link-port-dto";
import {GachiPointDto} from "../../../PointDto/gachi-point-dto";
import {EditableLinkCapTypes} from "../../../../../Model/Whiteboard/Whiteboard-Item/Whiteboard-Shape/LinkPort/EditableLink/editable-link-types.enum";
import {GachiColorDto} from "../../../ColorDto/gachi-color-dto";
import {LinkPort} from "../../../../../Model/Whiteboard/Whiteboard-Item/Whiteboard-Shape/LinkPort/link-port";


export class EditableLinkDto extends WhiteboardItemDto {
  private readonly _toLinkPort: LinkPortDto;
  private readonly _toPoint: GachiPointDto;
  private readonly _fromLinkPort: LinkPortDto;
  private readonly _fromPoint: GachiPointDto;
  private readonly _linkHeadType: EditableLinkCapTypes;
  private readonly _linkTailType: EditableLinkCapTypes;
  private readonly _capSize: number;
  private readonly _linkColor: GachiColorDto;
  private readonly _linkWidth: number;
  private readonly _isDashed: boolean;

  constructor(
    wbItemDto: WhiteboardItemDto,
    toLinkPort: LinkPort,
    toPoint: Point,
    fromLinkPort: LinkPort,
    fromPoint: Point,
    linkHeadType: EditableLinkCapTypes,
    linkTailType: EditableLinkCapTypes,
    capSize: number,
    linkColor: Color,
    linkWidth: number,
    isDashed: boolean,
  ) {
    super(wbItemDto.id, wbItemDto.type, wbItemDto.center, wbItemDto.isGrouped, wbItemDto.parentEdtGroupId);
    this._toLinkPort = toLinkPort ? new LinkPortDto(toLinkPort.direction, toLinkPort.owner.id) : undefined;
    this._toPoint = new GachiPointDto(toPoint.x, toPoint.y);
    this._fromLinkPort = fromLinkPort ? new LinkPortDto(fromLinkPort.direction, fromLinkPort.owner.id) : undefined;
    this._fromPoint = new GachiPointDto(fromPoint.x, fromPoint.y);
    this._linkHeadType = linkHeadType;
    this._linkTailType = linkTailType;
    this._capSize = capSize;
    this._linkColor = new GachiColorDto(linkColor.red, linkColor.green, linkColor.blue, linkColor.alpha);
    this._linkWidth = linkWidth;
    this._isDashed = isDashed;

  }

  get toLinkPort(): LinkPortDto {
    return this._toLinkPort;
  }

  get toPoint(): GachiPointDto {
    return this._toPoint;
  }

  get fromLinkPort(): LinkPortDto {
    return this._fromLinkPort;
  }

  get fromPoint(): GachiPointDto {
    return this._fromPoint;
  }

  get linkHeadType(): EditableLinkCapTypes {
    return this._linkHeadType;
  }

  get linkTailType(): EditableLinkCapTypes {
    return this._linkTailType;
  }

  get capSize(): number {
    return this._capSize;
  }

  get linkColor(): GachiColorDto {
    return this._linkColor;
  }

  get linkWidth(): number {
    return this._linkWidth;
  }

  get isDashed(): boolean {
    return this._isDashed;
  }
}
