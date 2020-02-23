import * as paper from 'paper';

import {EditableLink} from "../editable-link";
import {HandlerOption} from "../../../../ItemAdjustor/item-adjustor";
import {ZoomEvent} from "../../../../../InfiniteCanvas/ZoomControl/ZoomEvent/zoom-event";
import {ZoomEventEnum} from "../../../../../InfiniteCanvas/ZoomControl/ZoomEvent/zoom-event-enum.enum";
import {Subscription} from "rxjs";
import {LinkHandlerPositions} from "../link-handler-positions";
import {ItemLifeCycleEvent} from "../../../../WhiteboardItemLifeCycle/WhiteboardItemLifeCycle";
// @ts-ignore
import Path = paper.Path;
// @ts-ignore
import Color = paper.Color;
// @ts-ignore
import Rectangle = paper.Rectangle;
// @ts-ignore
import Size = paper.Size;
// @ts-ignore
import Point = paper.Point;

export class LinkHandler {
  private readonly _owner: EditableLink;
  private _coreItem: Path.Circle;
  private position: LinkHandlerPositions;

  private zoomEvent: Subscription;
  private linkChangeEvent: Subscription;

  constructor(owner: EditableLink, position: LinkHandlerPositions, fillColor: Color | string) {
    this._owner = owner;
    this.position = position;
    this.createHandler(fillColor);

    this.setOwnerLifeCycleEvent();
  }

  public enable() {
    this.coreItem.visible = true;
    this.coreItem.bringToFront();
    this.reflectZoomFactor();
    this.zoomEvent = this.zoomEventSubscription;
  }

  public disable() {
    this.coreItem.visible = false;
    if(!!this.zoomEvent) {
      this.zoomEvent.unsubscribe();
    }
  }

  public destroy() {
    if(!!this.zoomEvent) {
      this.zoomEvent.unsubscribe();
    }
    this.coreItem.remove();
  }

  public onMouseDown(event) {
  }

  public onMouseDrag(event) {
    this.owner.drawLink(event.point, this.position);
  }

  public onMouseUp(event) {

  }

  public moveTo(point: Point) {
    this.coreItem.position = point;
    this.coreItem.bringToFront();
    this.owner.layerService.globalSelectedGroup.emitMoved();
  }

  private setOwnerLifeCycleEvent() {
    this.owner.lifeCycleEmitter.subscribe((event: ItemLifeCycleEvent) => {
      let item = event.item as EditableLink;
      switch (this.position) {
        case LinkHandlerPositions.END_OF_LINK:
          this.moveTo(item.toPoint);
          break;
        case LinkHandlerPositions.ENTRY_OF_LINK:
          this.moveTo(item.fromPoint);
          break;
      }
    });
  }

  private createHandler(fillColor: Color | string) {
    let zoomFactor = this._owner.layerService.posCalcService.getZoomState();
    let coreItem = this._owner.coreItem as Path;

    let handlerLocation: Point;

    switch (this.position) {
      case LinkHandlerPositions.END_OF_LINK:
        handlerLocation = coreItem.lastSegment.point;
        break;
      case LinkHandlerPositions.ENTRY_OF_LINK:
        handlerLocation = coreItem.firstSegment.point;
        break;
    }

    this._coreItem = new Path.Circle(
      handlerLocation,
      HandlerOption.circleRadius / zoomFactor
    );

    this._coreItem.visible = false;
    this._coreItem.strokeWidth = HandlerOption.strokeWidth / zoomFactor;

    if(fillColor instanceof Color) {
      this._coreItem.fillColor = fillColor;
    } else {
      this._coreItem.fillColor = new Color(fillColor);
    }
    this._coreItem.strokeColor = new Color(HandlerOption.strokeColor);
    this._coreItem.data.struct = this;
  }

  private get zoomEventSubscription(): Subscription {
    return this._owner.layerService.infiniteCanvasService.zoomEventEmitter.subscribe((zoomEvent: ZoomEvent) => {
      if(zoomEvent.action === ZoomEventEnum.ZOOM_CHANGED) {
        this.reflectZoomFactor();
      }
    });
  }

  private reflectZoomFactor() {
    let zoomFactor = this.owner.layerService.posCalcService.getZoomState();
    let radius = HandlerOption.circleRadius / zoomFactor;
    let center = this.coreItem.position;
    let size = new Size(radius * 2, radius * 2);

    this.coreItem.strokeWidth = HandlerOption.strokeWidth / zoomFactor;
    this.coreItem.bounds = new Rectangle(size);
    this.coreItem.position = center;
  }

  get isEnable(): boolean {
    return this.coreItem.visible;
  }

  get coreItem(): Path.Circle {
    return this._coreItem;
  }

  get owner(): EditableLink {
    return this._owner;
  }
}
