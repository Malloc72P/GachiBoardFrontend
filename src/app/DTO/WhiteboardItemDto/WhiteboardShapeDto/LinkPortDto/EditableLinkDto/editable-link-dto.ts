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
    toLinkPort: LinkPort | LinkPortDto,
    toPoint: Point | GachiPointDto,
    fromLinkPort: LinkPort | LinkPortDto,
    fromPoint: Point | GachiPointDto,
    linkHeadType: EditableLinkCapTypes,
    linkTailType: EditableLinkCapTypes,
    capSize: number,
    linkColor: Color | GachiColorDto,
    linkWidth: number,
    isDashed: boolean,
  ) {
    super(wbItemDto.id, wbItemDto.type, wbItemDto.center, wbItemDto.isGrouped, wbItemDto.parentEdtGroupId);
    if(!toLinkPort) {
      this._toLinkPort = undefined;
    } else if(toLinkPort instanceof LinkPort) {
      this._toLinkPort = new LinkPortDto(toLinkPort.direction, toLinkPort.owner.id);
    } else if (toLinkPort instanceof LinkPortDto) {
      this._toLinkPort = toLinkPort.clone();
    }
    if(!toPoint) {
      this._toPoint = undefined;
    } else if(toPoint instanceof Point) {
      this._toPoint = new GachiPointDto(toPoint.x, toPoint.y);
    } else if (toPoint instanceof GachiPointDto) {
      this._toPoint = toPoint.clone();
    }

    if(!fromLinkPort) {
      this._fromLinkPort = undefined;
    } else if(fromLinkPort instanceof LinkPort) {
      this._fromLinkPort = new LinkPortDto(fromLinkPort.direction, fromLinkPort.owner.id);
    } else if (fromLinkPort instanceof LinkPortDto) {
      this._fromLinkPort = fromLinkPort.clone();
    }
    if(!fromPoint) {
      this._fromPoint = undefined;
    } else if(fromPoint instanceof Point) {
      this._fromPoint = new GachiPointDto(fromPoint.x, fromPoint.y);
    } else if (fromPoint instanceof GachiPointDto) {
      this._fromPoint = fromPoint.clone();
    }

    if(!linkColor) {
      this._linkColor = undefined;
    } else if(linkColor instanceof Color) {
      this._linkColor = new GachiColorDto(linkColor.red, linkColor.green, linkColor.blue, linkColor.alpha);
    } else if (linkColor instanceof GachiColorDto) {
      this._linkColor = linkColor.clone();
    }

    this._linkHeadType = linkHeadType;
    this._linkTailType = linkTailType;
    this._capSize = capSize;
    this._linkWidth = linkWidth;
    this._isDashed = isDashed;

  }

  public clone() {
    return new EditableLinkDto(
      new WhiteboardItemDto(this.id, this.type, this.center, this.isGrouped, this.parentEdtGroupId),
      this.toLinkPort, this.toPoint, this.fromLinkPort, this.fromPoint,
      this.linkHeadType, this.linkTailType,
      this.capSize, this.linkColor, this.linkWidth, this.isDashed
    );
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
