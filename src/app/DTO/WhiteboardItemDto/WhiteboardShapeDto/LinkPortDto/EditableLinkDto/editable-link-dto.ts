import {WhiteboardItemDto} from "../../../whiteboard-item-dto";
import {LinkPortDto} from "../link-port-dto";
import {GachiPointDto} from "../../../PointDto/gachi-point-dto";
import {EditableLinkCapTypes} from "../../../../../Model/Whiteboard/Whiteboard-Item/Whiteboard-Shape/LinkPort/EditableLink/editable-link-types.enum";
import {GachiColorDto} from "../../../ColorDto/gachi-color-dto";


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
    toLinkPort: LinkPortDto,
    toPoint: GachiPointDto,
    fromLinkPort: LinkPortDto,
    fromPoint: GachiPointDto,
    linkHeadType: EditableLinkCapTypes,
    linkTailType: EditableLinkCapTypes,
    capSize: number,
    linkColor: GachiColorDto,
    linkWidth: number,
    isDashed: boolean,
    isLocked,
  ) {
    super(wbItemDto.id, wbItemDto.type, wbItemDto.center, wbItemDto.isGrouped, wbItemDto.parentEdtGroupId, isLocked);

    this.toLinkPort = LinkPortDto.clone(toLinkPort);
    this.toPoint = GachiPointDto.clone(toPoint);
    this.fromLinkPort = LinkPortDto.clone(fromLinkPort);
    this.fromPoint = GachiPointDto.clone(fromPoint);
    this.linkColor = GachiColorDto.clone(linkColor);
    this.linkHeadType = linkHeadType;
    this.linkTailType = linkTailType;
    this.capSize = capSize;
    this.linkWidth = linkWidth;
    this.isDashed = isDashed;
  }

  public static clone(dto: EditableLinkDto) {
    return new EditableLinkDto(
      new WhiteboardItemDto(dto.id, dto.type, dto.center, dto.isGrouped, dto.parentEdtGroupId, dto.isLocked),
      dto.toLinkPort, dto.toPoint, dto.fromLinkPort, dto.fromPoint,
      dto.linkHeadType, dto.linkTailType,
      dto.capSize, dto.linkColor, dto.linkWidth, dto.isDashed,dto.isLocked
    );
  }
}
