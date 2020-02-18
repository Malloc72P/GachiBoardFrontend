import * as paper from 'paper';

import {EditableLinkCapTypes} from "./editable-link-types.enum";
import {WhiteboardItemType} from "../../../../../Helper/data-type-enum/data-type.enum";
import {LinkPort} from "../link-port";
import {WhiteboardItem} from "../../../whiteboard-item";
import {DrawingLayerManagerService} from "../../../../InfiniteCanvas/DrawingLayerManager/drawing-layer-manager.service";
import {ItemLifeCycleEnum, ItemLifeCycleEvent} from "../../../WhiteboardItemLifeCycle/WhiteboardItemLifeCycle";
import {LinkAdjustorPositionEnum} from "./LinkAdjustorPositionEnum/link-adjustor-position-enum.enum";
import {LinkHandler} from "./LinkHandler/link-handler";
// @ts-ignore
import Path = paper.Path;
// @ts-ignore
import Point = paper.Point;
// @ts-ignore
import Color = paper.Color;
// @ts-ignore
import Group = paper.Group;

export class NewEditableLink extends WhiteboardItem {
  private _toLinkPort: LinkPort;     // DTO 전송시 to, from Link Port 가 있으면 linkLine 은 null
  private _fromLinkPort: LinkPort;   // 반대로 to, from Link Port 가 없으면 linkLine 을 DTO 에 실어 보냄
  private _linkHeadType: EditableLinkCapTypes;
  private _linkTailType: EditableLinkCapTypes;
  private _capSize = 10;
  // private linkColor: Color;      // 실제로는 getter 와 setter 로 Path 오브젝트에 직접 접근할 예정
  // private linkWidth: number;     // DTO 도 마찬가지로 사용할 예정
  // private isDashed: boolean;

  private downPoint: Point;
  private linkLine: Path;
  private linkHead: Path;
  private linkTail: Path;
  private linkHandlers: Map<LinkAdjustorPositionEnum, LinkHandler>;

  constructor(
    id: number,
    item: Group,
    linkHeadType: EditableLinkCapTypes,
    linkTailType: EditableLinkCapTypes,
    layerService: DrawingLayerManagerService,
  ) {
    super(id, WhiteboardItemType.EDITABLE_LINK, item.children[0], layerService);
    this.linkLine = item.children[0] as Path;
    this.linkHead = item.children[1] as Path;
    this.linkTail = item.children[2] as Path;
    this.initLinkHandler();
  }

  public initLink(startPoint: Point) {
    this.downPoint = startPoint;
  }

  public drawLink(point: Point) {
    this.linkLine.lastSegment.point = point;
    this.drawCaps();
  }

  public destroyItem() {
    this.linkHead.remove();
    this.linkTail.remove();
    this.linkLine.remove();
  }

  public notifyItemCreation() {
    this.wbItemsLifeCycleEventEmitter.emit(new ItemLifeCycleEvent(this.id, this, ItemLifeCycleEnum.CREATE));
  }
  public notifyItemModified() {
    this.wbItemsLifeCycleEventEmitter.emit(new ItemLifeCycleEvent(this.id, this, ItemLifeCycleEnum.MODIFY));
  }
  public refreshItem() {

  }

  private initLinkHandler() {
    // this.linkHandlers = new Map<LinkAdjustorPositionEnum, LinkHandler>();
    // this.linkHandlers.set(LinkAdjustorPositionEnum.END_OF_LINK, new LinkHandler(this, 'skyblue'));
    // this.linkHandlers.set(LinkAdjustorPositionEnum.ENTRY_OF_LINK, new LinkHandler(this, 'skyblue'));
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
        let wingVector: Point = vector.normalize(this._capSize);
        let leftWing: Point = lastPoint.add(wingVector.rotate(35, null));
        let rightWing: Point = lastPoint.add(wingVector.rotate(-35, null));

        cap.removeSegments();
        cap.add(leftWing);
        cap.add(lastPoint);
        cap.add(rightWing);
        break;
      case EditableLinkCapTypes.NONE:
        break;
    }
  }

  get linkColor(): Color {
    return this.linkLine.strokeColor;
  }

  set linkColor(value: Color) {
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
  }

  set isDashed(value: boolean) {
    if(value) {
      this.linkLine.dashArray = [this.linkLine.strokeWidth * 2, this.linkLine.strokeWidth * 2];
    } else {
      this.linkLine.dashArray = undefined;
    }
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
    this._toLinkPort = value;
  }

  get fromLinkPort(): LinkPort {
    return this._fromLinkPort;
  }

  set fromLinkPort(value: LinkPort) {
    this._fromLinkPort = value;
  }

  get linkHeadType(): EditableLinkCapTypes {
    return this._linkHeadType;
  }

  set linkHeadType(value: EditableLinkCapTypes) {
    this._linkHeadType = value;
  }

  get linkTailType(): EditableLinkCapTypes {
    return this._linkTailType;
  }

  set linkTailType(value: EditableLinkCapTypes) {
    this._linkTailType = value;
  }
}
