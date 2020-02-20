import * as paper from 'paper';

import {Injectable} from '@angular/core';
import {EditableLinkCapTypes} from "../../Whiteboard-Item/Whiteboard-Shape/LinkPort/EditableLink/editable-link-types.enum";
import {DrawingLayerManagerService} from "../../InfiniteCanvas/DrawingLayerManager/drawing-layer-manager.service";
import {WhiteboardItemType} from "../../../Helper/data-type-enum/data-type.enum";
// @ts-ignore
import Point = paper.Point;
// @ts-ignore
import Path = paper.Path;
// @ts-ignore
import Color = paper.Color;
// @ts-ignore
import Group = paper.Group;
import {WhiteboardItem} from "../../Whiteboard-Item/whiteboard-item";
import {LinkHandlerPositions} from "../../Whiteboard-Item/Whiteboard-Shape/LinkPort/EditableLink/link-handler-positions";
import {WhiteboardShape} from "../../Whiteboard-Item/Whiteboard-Shape/whiteboard-shape";
import {LinkPort} from "../../Whiteboard-Item/Whiteboard-Shape/LinkPort/link-port";

@Injectable({
  providedIn: 'root'
})
export class LinkService {
  private downPoint: Point;
  private newLinkLine: Path;
  private newLinkHead: Path;
  private newLinkTail: Path;
  private toLinkPort: LinkPort;
  private fromLinkPort: LinkPort;

  private newLinkColor: Color;
  private newLinkWidth: number;
  private newLinkCapSize: number;
  private newLinkIsDashed: boolean;
  private newLinkHeadType: EditableLinkCapTypes;
  private newLinkTailType: EditableLinkCapTypes;

  constructor(
    private layerService: DrawingLayerManagerService,
  ) {
    this.newLinkColor = new Color('black');
    this.newLinkWidth = 3;
    this.newLinkCapSize = 20;
    this.newLinkIsDashed = false;

    // TODO : TEST CODE
    this.newLinkHeadType = EditableLinkCapTypes.ARROW;
    this.newLinkTailType = EditableLinkCapTypes.ARROW;
  }

  public createLink(event, fromLinkPort?: LinkPort) {
    this.downPoint = event.point;
    if(!!fromLinkPort) {
      this.fromLinkPort = fromLinkPort;
      this.downPoint = this.fromLinkPort.calcLinkPortPosition();
    }
    this.newLinkLine = this.createLine(this.newLinkColor, this.newLinkWidth);

    this.initLineSegments();
    this.newLinkHead = this.createCap();
    this.newLinkTail = this.createCap();
  }

  public drawLink(event) {
    let hitItem: WhiteboardItem = this.layerService.getHittedItem(event.point);

    if(hitItem instanceof WhiteboardShape) {
      if(!!this.fromLinkPort) {
        if(hitItem.id !== this.fromLinkPort.owner.id){
          // 링크의 시작이 링크포트이고 시작과 끝이 같은 아이템이 아님
          this.drawToHitItem(hitItem, event.point);
        } else {
          // 링크의 시작이 링크포트이고 시작과 끝이 같은 아이템임 => 마우스 커서 위치에 그냥 그림
          this.drawToPoint(event.point);
        }
      } else {
        // 링크의 시작이 링크 포트가 아닌데 도형에 닿았음 => 어떤 도형에 닿든 상관 없음
        this.drawToHitItem(hitItem, event.point);
      }
    } else {
      // 힛 아이템이 없거나 도형이 아님 => 아무데나 막 그림
      this.drawToPoint(event.point);
    }
    this.drawCaps();
  }

  private drawToHitItem(hitItem: WhiteboardShape, point: Point) {
    let closestLinkPort = hitItem.linkPortMap.get(hitItem.getClosestLinkPort(point));
    this.newLinkLine.lastSegment.point = closestLinkPort.calcLinkPortPosition();
    this.toLinkPort = closestLinkPort;
  }
  private drawToPoint(point: Point) {
    this.newLinkLine.lastSegment.point = point;
    this.toLinkPort = undefined;
  }

  public endLink(event) {
    let newGroup: Group = new Group();
    newGroup.addChildren([
      this.newLinkLine,
      this.newLinkHead,
      this.newLinkTail,
    ]);
    this.layerService.addToDrawingLayer(
      newGroup,
      WhiteboardItemType.EDITABLE_LINK,
      this.newLinkHeadType,
      this.newLinkTailType,
      this.toLinkPort,
      this.fromLinkPort,
    );

    this.toLinkPort = undefined;
    this.fromLinkPort = undefined;
  }

  private initLineSegments() {
    this.newLinkLine.removeSegments();
    this.newLinkLine.add(this.downPoint);
    this.newLinkLine.add(this.downPoint);
  }

  private createLine(color: Color, width: number): Path {
    return new Path.Line({
      strokeColor: color,
      strokeWidth: width,
      strokeCap: 'round',
      strokeJoin: 'round',
      dashArray: this.isDashed ? [this.newLinkWidth * 2, this.newLinkWidth * 2] : undefined,
    });
  }

  private createCap(): Path {
    return new Path({
      strokeColor: this.linkColor,
      strokeWidth: this.linkWidth,
      strokeCap: 'round',
      strokeJoin: 'round',
    });
  }

  private drawCaps() {
    this.drawCap(true);
    this.drawCap(false);
  }
  private drawCap(isHead?: boolean) {
    // Head or Tail Init for Reusable
    let type = isHead ? this.newLinkHeadType : this.newLinkTailType;
    let firstPoint = isHead ? this.newLinkLine.firstSegment.point : this.newLinkLine.lastSegment.point;
    let lastPoint = isHead ? this.newLinkLine.lastSegment.point : this.newLinkLine.firstSegment.point;
    let cap = isHead ? this.newLinkHead : this.newLinkTail;

    switch (type) {
      case EditableLinkCapTypes.ARROW:
        let vector = firstPoint.subtract(lastPoint);
        let wingVector = vector.normalize(this.newLinkCapSize);
        let leftWing = lastPoint.add(wingVector.rotate(35, null));
        let rightWing = lastPoint.add(wingVector.rotate(-35, null));

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
    return this.newLinkLine.strokeColor;
  }

  set linkColor(value: Color) {
    this.newLinkColor = value;
  }

  get linkWidth(): number {
    return this.newLinkLine.strokeWidth;
  }

  set linkWidth(value: number) {
    this.newLinkWidth = value;
  }

  get isDashed(): boolean {
    return this.newLinkIsDashed;
  }

  set isDashed(value: boolean) {
    this.newLinkIsDashed = value;
  }
}
