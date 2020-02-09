import * as paper from 'paper';

import {EditableLink} from "../editable-link";
import {HandlerOption} from "../../../../ItemAdjustor/item-adjustor";
import {ZoomEvent} from "../../../../../InfiniteCanvas/ZoomControl/ZoomEvent/zoom-event";
import {ZoomEventEnum} from "../../../../../InfiniteCanvas/ZoomControl/ZoomEvent/zoom-event-enum.enum";
import {Subscription} from "rxjs";
import {LinkEvent} from "../../LinkEvent/link-event";
import {LinkEventEnum} from "../../LinkEvent/link-event-enum.enum";
import {WhiteboardShape} from "../../../whiteboard-shape";
// @ts-ignore
import Path = paper.Path;
// @ts-ignore
import Color = paper.Color;
// @ts-ignore
import Rectangle = paper.Rectangle;
// @ts-ignore
import Size = paper.Size;

export class LinkHandler {
  private readonly _owner: EditableLink;
  private _coreItem: Path.Circle;

  private zoomEvent: Subscription;
  private linkChangeEvent: Subscription;

  constructor(owner: EditableLink, fillColor: Color | string) {
    this._owner = owner;
    this.createHandler(fillColor);

    this.linkChangeEvent = this.linkChangeEventSubscription;
    this.linkSelectedEventAttach();
  }

  public enable() {
    this.coreItem.visible = true;
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
    this.owner.initTempLink(event.point);
  }

  public onMouseDrag(event) {
    if(this.owner.isHide) {
      this.owner.hideLinkObject();
    }
    this.owner.drawTempLink(event.point);
  }

  public onMouseUp(event) {
    this.owner.destroyTempLink();

    let hitWbShape: WhiteboardShape = this.owner.layerService.getHittedItem(event.point) as WhiteboardShape;
    if(hitWbShape && hitWbShape.id !== this.owner.fromLinkPort.owner.id && hitWbShape.linkPortMap) {
      let toLinkPort = hitWbShape.linkPortMap.get(hitWbShape.getClosestLinkPort(event.point));

      if(toLinkPort === this.owner.toLinkPort) {
        this.owner.showLinkObject();

        return;
      }

      this.owner.toLinkPort = toLinkPort;
      this.owner.setToLinkEventEmitter();
      if(!!this.linkChangeEvent) {
        this.linkChangeEvent.unsubscribe();
      }
      this.linkChangeEvent = this.linkChangeEventSubscription;
    }
    this.owner.showLinkObject();
  }

  private createHandler(fillColor: Color | string) {
    let zoomFactor = this._owner.layerService.posCalcService.getZoomState();

    this._coreItem = new Path.Circle(
      this._owner.linkObject.lastSegment.point,
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

  private linkSelectedEventAttach() {
    this._owner.fromLinkEventEmitter.subscribe((linkEvent: LinkEvent) => {
      if(linkEvent.action === LinkEventEnum.WB_ITEM_DESELECTED) {
        this.disable();
      }
    });
    this._owner.linkEventEmitter.subscribe((linkEvent: LinkEvent) => {
      if(linkEvent.action === LinkEventEnum.WB_ITEM_SELECTED) {
        this.enable();
      }
    });
  }

  private get linkChangeEventSubscription(): Subscription {
    return this._owner.toLinkEventEmitter.subscribe((linkEvent: LinkEvent) => {
      if(linkEvent.action === LinkEventEnum.WB_ITEM_MODIFIED) {
        this.coreItem.position = linkEvent.invokerItem.linkObject.lastSegment.point;
        this.coreItem.bringToFront();
      }
    });
  }

  private get zoomEventSubscription(): Subscription {
    return this._owner.layerService.infiniteCanvasService.zoomEventEmitter.subscribe((zoomEvent: ZoomEvent) => {
      if(zoomEvent.action === ZoomEventEnum.ZOOM_CHANGED) {
        let radius = HandlerOption.circleRadius / zoomEvent.zoomFactor;
        let center = this.coreItem.position;
        let size = new Size(radius * 2, radius * 2);

        this.coreItem.strokeWidth = HandlerOption.strokeWidth / zoomEvent.zoomFactor;
        this.coreItem.bounds = new Rectangle(size);
        this.coreItem.position = center;
      }
    });
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
