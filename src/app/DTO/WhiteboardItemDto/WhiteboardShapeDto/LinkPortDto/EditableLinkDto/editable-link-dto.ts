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
  public toLinkPort: LinkPortDto;
  public toPoint: GachiPointDto;
  public fromLinkPort: LinkPortDto;
  public fromPoint: GachiPointDto;
  public linkHeadType: EditableLinkCapTypes;
  public linkTailType: EditableLinkCapTypes;
  public capSize: number;
  public linkColor: GachiColorDto;
  public linkWidth: number;
  public isDashed: boolean;

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
      this.toLinkPort = undefined;
    } else if(toLinkPort instanceof LinkPort) {
      this.toLinkPort = new LinkPortDto(toLinkPort.direction, toLinkPort.owner.id);
    } else if (toLinkPort instanceof LinkPortDto) {
      this.toLinkPort = LinkPortDto.clone(toLinkPort);
    }
    if(!toPoint) {
      this.toPoint = undefined;
    } else if(toPoint instanceof Point) {
      this.toPoint = new GachiPointDto(toPoint.x, toPoint.y);
    } else if (toPoint instanceof GachiPointDto) {
      this.toPoint = GachiPointDto.clone(toPoint);
    }

    if(!fromLinkPort) {
      this.fromLinkPort = undefined;
    } else if(fromLinkPort instanceof LinkPort) {
      this.fromLinkPort = new LinkPortDto(fromLinkPort.direction, fromLinkPort.owner.id);
    } else if (fromLinkPort instanceof LinkPortDto) {
      this.fromLinkPort = LinkPortDto.clone(fromLinkPort);
    }
    if(!fromPoint) {
      this.fromPoint = undefined;
    } else if(fromPoint instanceof Point) {
      this.fromPoint = new GachiPointDto(fromPoint.x, fromPoint.y);
    } else if (fromPoint instanceof GachiPointDto) {
      this.fromPoint = GachiPointDto.clone(fromPoint);
    }

    if(!linkColor) {
      this.linkColor = undefined;
    } else if(linkColor instanceof Color) {
      this.linkColor = new GachiColorDto(linkColor.red, linkColor.green, linkColor.blue, linkColor.alpha);
    } else if (linkColor instanceof GachiColorDto) {
      this.linkColor = GachiColorDto.clone(linkColor);
    }

    this.linkHeadType = linkHeadType;
    this.linkTailType = linkTailType;
    this.capSize = capSize;
    this.linkWidth = linkWidth;
    this.isDashed = isDashed;

  }

  public static clone(dto: EditableLinkDto) {
    return new EditableLinkDto(
      new WhiteboardItemDto(dto.id, dto.type, dto.center, dto.isGrouped, dto.parentEdtGroupId),
      dto.toLinkPort, dto.toPoint, dto.fromLinkPort, dto.fromPoint,
      dto.linkHeadType, dto.linkTailType,
      dto.capSize, dto.linkColor, dto.linkWidth, dto.isDashed
    );
  }

  public clone() {
    return new EditableLinkDto(
      new WhiteboardItemDto(this.id, this.type, this.center, this.isGrouped, this.parentEdtGroupId),
      this.toLinkPort, this.toPoint, this.fromLinkPort, this.fromPoint,
      this.linkHeadType, this.linkTailType,
      this.capSize, this.linkColor, this.linkWidth, this.isDashed
    );
  }
}
