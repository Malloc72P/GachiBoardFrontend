import * as paper from 'paper';
// @ts-ignore
import Path = paper.Path;
// @ts-ignore
import Point = paper.Point;
// @ts-ignore
import Color = paper.Color;
// @ts-ignore
import Group = paper.Group;

import {EditableLinkCapTypes} from "./editable-link-types.enum";
import {WhiteboardItemType} from "../../../../../Helper/data-type-enum/data-type.enum";
import {LinkPort} from "../link-port";
import {WhiteboardItem} from "../../../whiteboard-item";
import {DrawingLayerManagerService} from "../../../../InfiniteCanvas/DrawingLayerManager/drawing-layer-manager.service";
import {ItemLifeCycleEnum, ItemLifeCycleEvent} from "../../../WhiteboardItemLifeCycle/WhiteboardItemLifeCycle";
import {LinkHandlerPositions} from "./link-handler-positions";
import {LinkHandler} from "./LinkHandler/link-handler";
import {WhiteboardShape} from "../../whiteboard-shape";
import {Subscription} from "rxjs";
import {EditableLinkDto} from "../../../../../../DTO/WhiteboardItemDto/WhiteboardShapeDto/LinkPortDto/EditableLinkDto/editable-link-dto";
import {LinkPortDto} from "../../../../../../DTO/WhiteboardItemDto/WhiteboardShapeDto/LinkPortDto/link-port-dto";
import {GachiPointDto} from "../../../../../../DTO/WhiteboardItemDto/PointDto/gachi-point-dto";
import {GachiColorDto} from "../../../../../../DTO/WhiteboardItemDto/ColorDto/gachi-color-dto";

export class EditableLink extends WhiteboardItem {
  private _toLinkPort: LinkPort;     // DTO 전송시 to, from Link Port 가 있으면 linkLine 은 null
  private _fromLinkPort: LinkPort;   // 반대로 to, from Link Port 가 없으면 linkLine 을 DTO 에 실어 보냄
  private _linkHeadType: EditableLinkCapTypes;
  private _linkTailType: EditableLinkCapTypes;
  private _capSize = 4;

  // private linkColor: Color;      // 실제로는 getter 와 setter 로 Path 오브젝트에 직접 접근할 예정
  // private linkWidth: number;     // DTO 도 마찬가지로 사용할 예정
  // private isDashed: boolean;

  private cursorDownPoint: Point;
  private linkLine: Path;
  private linkHead: Path;
  private linkTail: Path;
  private _linkHandlers: Map<LinkHandlerPositions, LinkHandler>;
  private toLinkPortLifeCycle: Subscription;
  private fromLinkPortLifeCycle: Subscription;

  constructor(
    id: number,
    item: Group,
    linkHeadType: EditableLinkCapTypes,
    linkTailType: EditableLinkCapTypes,
    layerService: DrawingLayerManagerService,
    toLinkPort?: LinkPort,
    fromLinkPort?: LinkPort,
  ) {
    super(id, WhiteboardItemType.EDITABLE_LINK, item.children[0], layerService);
    this.group.addChildren(item.children);
    this.linkLine = this.group.children[0] as Path;
    this.linkHead = this.group.children[1] as Path;
    this.linkTail = this.group.children[2] as Path;

    this.initLinkHandler();
    this.toLinkPort = toLinkPort ? toLinkPort : undefined;
    this.fromLinkPort = fromLinkPort ? fromLinkPort : undefined;
    this.linkHeadType = linkHeadType;
    this.linkTailType = linkTailType;

    this.setLifeCycleEvent();

    this.localEmitCreate();
    this.globalEmitCreate();
  }

  public initLink(startPoint: Point) {
    this.cursorDownPoint = startPoint;
  }

  public drawLink(point: Point, handle?: LinkHandlerPositions) {
    let hitItem: WhiteboardItem = this.layerService.getHittedItem(point, null, true);

    switch (handle) {
      case LinkHandlerPositions.END_OF_LINK:
        if(hitItem instanceof WhiteboardShape) {
          if(!!this._fromLinkPort) {
            if(hitItem.id !== this._fromLinkPort.owner.id) {
              this.toLinkPort = hitItem.linkPortMap.get(hitItem.getClosestLinkPort(point));
            } else {
              this.endPoint = point;
              this.toLinkPort = undefined;
            }
          } else {
            this.toLinkPort = hitItem.linkPortMap.get(hitItem.getClosestLinkPort(point));
          }
        } else {
          this.endPoint = point;
          this.toLinkPort = undefined;
        }
        break;
      case LinkHandlerPositions.ENTRY_OF_LINK:
        if(hitItem instanceof WhiteboardShape ) {
          if(!!this._toLinkPort) {
            if(hitItem.id !== this._toLinkPort.owner.id) {
              this.fromLinkPort = hitItem.linkPortMap.get(hitItem.getClosestLinkPort(point));
            } else {
              this.entryPoint = point;
              this.fromLinkPort = undefined;
            }
          } else {
            this.fromLinkPort = hitItem.linkPortMap.get(hitItem.getClosestLinkPort(point));
          }
        } else {
          this.entryPoint = point;
          this.fromLinkPort = undefined;
        }
      break;
    }
    this.drawCaps();
  }

  public enableHandlers() {
    this._linkHandlers.forEach(value => {
      value.enable();
    });
  }
  public disableHandlers() {
    this._linkHandlers.forEach(value => {
      value.disable();
    });
  }

  public destroyItem() {
    super.destroyItem();
    this.removeToLinkFromOwner();
    this.removeFromLinkFromOwner();
    this._linkHandlers.forEach(value => {
      value.destroy();
    });
    this.linkHead.remove();
    this.linkTail.remove();
    this.linkLine.remove();

    this.globalLifeCycleEmitter.emit(new ItemLifeCycleEvent(this.id, this, ItemLifeCycleEnum.DESTROY));
  }
  public destroyItemAndNoEmit() {
    super.destroyItem();
    this.removeToLinkFromOwner();
    this.removeFromLinkFromOwner();
    this._linkHandlers.forEach(value => {
      value.destroy();
    });
    this.linkHead.remove();
    this.linkTail.remove();
    this.linkLine.remove();
    this.destroyBlind();
  }

  public exportToDto(): EditableLinkDto {
    let wbItemDto = super.exportToDto();

    return new EditableLinkDto(
      wbItemDto,
      this.toLinkPort ? new LinkPortDto(this.toLinkPort.direction, this.toLinkPort.owner.id) : undefined,
      new GachiPointDto(this.toPoint.x, this.toPoint.y),
      this.fromLinkPort ? new LinkPortDto(this.fromLinkPort.direction, this.fromLinkPort.owner.id) : undefined,
      new GachiPointDto(this.fromPoint.x, this.fromPoint.y),
      this.linkHeadType,
      this.linkTailType,
      this.capSize,
      GachiColorDto.createColor(this.linkColor),
      this.linkWidth,
      this.isDashed
      )
  }

  public update(dto: EditableLinkDto) {
    super.update(dto);

    this.toLinkPort = this.getLinkPort(dto.toLinkPort);
    if(!this.toLinkPort) {
      this.endPoint = GachiPointDto.getPaperPoint(dto.toPoint);
    }

    this.fromLinkPort = this.getLinkPort(dto.fromLinkPort);
    if(!this.fromLinkPort) {
      this.entryPoint = GachiPointDto.getPaperPoint(dto.fromPoint);
    }

    this.linkHeadType = dto.linkHeadType;
    this.linkTailType = dto.linkTailType;
    this.capSize = dto.capSize;
    this.linkColor = GachiColorDto.getPaperColor(dto.linkColor);
    this.linkWidth = dto.linkWidth;
    this.isDashed = dto.isDashed;
  }

  private getLinkPort(dto: LinkPortDto) {
    if(!dto) {
      return undefined;
    }

    for(let wbItem of this.layerService.whiteboardItemArray) {
      if(wbItem.id === dto.ownerWbItemId && wbItem instanceof WhiteboardShape) {
        return wbItem.linkPortMap.get(dto.direction);
      }
    }
    return undefined;
  }

  private subscribeToLinkPortOwnerLifeCycle(): Subscription {
    if(!!this.toLinkPortLifeCycle) {
      this.toLinkPortLifeCycle.unsubscribe();
    }
    return this.toLinkPort.owner.localLifeCycleEmitter.subscribe((event: ItemLifeCycleEvent) => {
      switch (event.action) {
        case ItemLifeCycleEnum.MOVED:
        case ItemLifeCycleEnum.RESIZED:
          this.endPoint = this.toLinkPort.calcLinkPortPosition();
          break;
      }
    });
  }

  private subscribeFromLinkPortOwnerLifeCycle(): Subscription {
    if(!!this.fromLinkPortLifeCycle) {
      this.fromLinkPortLifeCycle.unsubscribe();
    }
    return this.fromLinkPort.owner.localLifeCycleEmitter.subscribe((event: ItemLifeCycleEvent) => {
      switch (event.action) {
        case ItemLifeCycleEnum.DESTROY:
          this.destroyItem();
          break;
        case ItemLifeCycleEnum.MOVED:
        case ItemLifeCycleEnum.RESIZED:
          this.entryPoint = this.fromLinkPort.calcLinkPortPosition();
          break;
      }
    });
  }

  private setLifeCycleEvent() {
    this.localLifeCycleEmitter.subscribe((event: ItemLifeCycleEvent) => {
      switch (event.action) {
        case ItemLifeCycleEnum.MOVED:
        case ItemLifeCycleEnum.RESIZED:
          this.refreshLink();
          break;
        case ItemLifeCycleEnum.DESELECTED:
          this.disableHandlers();
          break;
      }
    });
  }

  private initLinkHandler() {
    this._linkHandlers = new Map<LinkHandlerPositions, LinkHandler>();
    this._linkHandlers.set(LinkHandlerPositions.END_OF_LINK, new LinkHandler(this, LinkHandlerPositions.END_OF_LINK, 'skyblue'));
    this._linkHandlers.set(LinkHandlerPositions.ENTRY_OF_LINK, new LinkHandler(this, LinkHandlerPositions.ENTRY_OF_LINK, 'skyblue'));
  }

  private drawCaps() {
    this.drawCap(true);
    this.drawCap(false);
  }
  private drawCap(isHead?: boolean) {
    // Head or Tail Init for Reusable
    let type: EditableLinkCapTypes = isHead ? this._linkHeadType : this._linkTailType;
    let firstPoint: Point = isHead ? this.linkLine.firstSegment.point : this.linkLine.lastSegment.point;
    let lastPoint: Point = isHead ? this.linkLine.lastSegment.point : this.linkLine.firstSegment.point;
    let cap: Path = isHead ? this.linkHead : this.linkTail;

    switch (type) {
      case EditableLinkCapTypes.ARROW:
        let vector: Point = firstPoint.subtract(lastPoint);
        let wingVector: Point = vector.normalize(this.linkWidth * this._capSize);
        let leftWing: Point = lastPoint.add(wingVector.rotate(35, null));
        let rightWing: Point = lastPoint.add(wingVector.rotate(-35, null));

        cap.removeSegments();
        cap.add(leftWing);
        cap.add(lastPoint);
        cap.add(rightWing);
        break;
      case EditableLinkCapTypes.NONE:
        cap.removeSegments();
        break;
    }
  }

  private refreshLink() {
    if(!!this._toLinkPort) {
      this.endPoint = this._toLinkPort.calcLinkPortPosition();
    }
    if(!!this._fromLinkPort) {
      this.entryPoint = this._fromLinkPort.calcLinkPortPosition();
    }
  }

  private removeToLinkFromOwner() {
    if(!!this.toLinkPort) {
      for(let index = 0; index < this.toLinkPort.fromLinkList.length; index++) {
        if(this.toLinkPort.fromLinkList[index].id === this.id) {
          this.toLinkPort.fromLinkList.splice(index, 1);
          this.toLinkPort = undefined;
          break;
        }
      }
    }
  }

  private removeFromLinkFromOwner() {
    if(!!this.fromLinkPort) {
      for(let index = 0; index < this.fromLinkPort.fromLinkList.length; index++) {
        if(this.fromLinkPort.fromLinkList[index].id === this.id) {
          this.fromLinkPort.fromLinkList.splice(index, 1);
          this.fromLinkPort = undefined;
          break;
        }
      }
    }
  }

  // ######### Static Method #########
  public static createLinkLine(fromPoint: Point, toPoint: Point, linkColor: Color, linkWidth: number, isDashed: boolean): Path {
    return new Path.Line({
      from: fromPoint, to: toPoint,
      strokeColor: linkColor, strokeWidth: linkWidth,
      strokeCap: 'round', strokeJoin: 'round',
      dashArray: isDashed ? [linkWidth * 2, linkWidth * 2] : undefined
    });
  }

  public static createCap(linkColor: Color, linkWidth: number): Path {
    return new Path({
      strokeColor: linkColor,
      strokeWidth: linkWidth,
      strokeCap: 'round', strokeJoin: 'round',
    });
  }


  get linkColor(): Color {
    return this.linkLine.strokeColor;
  }

  set linkColor(value: Color) {
    if(!!this.linkHead) {
      this.linkHead.strokeColor = value;
    }
    if(!!this.linkTail) {
      this.linkTail.strokeColor = value;
    }
    this.linkLine.strokeColor = value;
  }

  get linkWidth(): number {
    return this.linkLine.strokeWidth;
  }

  set linkWidth(value: number) {
    if(!!this.linkHead) {
      this.linkHead.strokeWidth = value;
    }
    if(!!this.linkTail) {
      this.linkTail.strokeWidth = value;
    }
    this.linkLine.strokeWidth = value;
    this.drawCaps();
  }

  set isDashed(value: boolean) {
    if(value) {
      this.linkLine.dashArray = [this.linkLine.strokeWidth * 2, this.linkLine.strokeWidth * 2];
    } else {
      this.linkLine.dashArray = undefined;
    }
  }

  get isDashed(): boolean {
    return !!this.linkLine.dashArray.length;
  }

  get capSize(): number {
    return this._capSize;
  }

  set capSize(value: number) {
    this._capSize = value;
    this.drawCaps();
  }

  get toLinkPort(): LinkPort {
    return this._toLinkPort;
  }

  set toLinkPort(value: LinkPort) {
    if(!!value) {
      // 이전 링크포트에서 링크 제거
      this.removeToLinkFromOwner();
      this._toLinkPort = value;
      value.fromLinkList.push(this);
      this.endPoint = value.calcLinkPortPosition();
      this.toLinkPortLifeCycle = this.subscribeToLinkPortOwnerLifeCycle();
    } else {
      if(!!this.toLinkPortLifeCycle) {
        this.toLinkPortLifeCycle.unsubscribe();
      }
      this._toLinkPort = value;
    }
  }

  set endPoint(value: Point) {
    this.linkLine.lastSegment.point = value;
    this.linkHandlers.get(LinkHandlerPositions.END_OF_LINK).moveTo(value);
    this.drawCaps();
  }

  get fromLinkPort(): LinkPort {
    return this._fromLinkPort;
  }

  set fromLinkPort(value: LinkPort) {
    if(!!value) {
      this.removeFromLinkFromOwner();

      this._fromLinkPort = value;
      value.fromLinkList.push(this);
      this.entryPoint = value.calcLinkPortPosition();
      this.fromLinkPortLifeCycle = this.subscribeFromLinkPortOwnerLifeCycle();
    } else {
      if(!!this.fromLinkPortLifeCycle) {
        this.fromLinkPortLifeCycle.unsubscribe();
      }
      this._fromLinkPort = value;
    }
  }

  set entryPoint(value: Point) {
    this.linkLine.firstSegment.point = value;
    this.linkHandlers.get(LinkHandlerPositions.ENTRY_OF_LINK).moveTo(value);
    this.drawCaps();
  }

  get linkHeadType(): EditableLinkCapTypes {
    return this._linkHeadType;
  }

  set linkHeadType(value: EditableLinkCapTypes) {
    this._linkHeadType = value;
    this.drawCap(true);
  }

  get linkTailType(): EditableLinkCapTypes {
    return this._linkTailType;
  }

  set linkTailType(value: EditableLinkCapTypes) {
    this._linkTailType = value;
    this.drawCap(false);
  }

  get linkHandlers(): Map<LinkHandlerPositions, LinkHandler> {
    return this._linkHandlers;
  }

  get toPoint(): Point {
    return this.linkLine.lastSegment.point;
  }

  get fromPoint(): Point {
    return this.linkLine.firstSegment.point;
  }
}
