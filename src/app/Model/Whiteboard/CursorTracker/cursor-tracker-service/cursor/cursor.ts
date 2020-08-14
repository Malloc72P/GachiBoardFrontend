import * as paper from 'paper';
// @ts-ignore
import Point = paper.Point;
// @ts-ignore
import Color = paper.Color;
// @ts-ignore
import CompoundPath = paper.CompoundPath;
// @ts-ignore
import Group = paper.Group;
// @ts-ignore
import PointText = paper.PointText;

import {EventEmitter} from "@angular/core";
import {ZoomEvent} from "../../../InfiniteCanvas/ZoomControl/ZoomEvent/zoom-event";
import {ZoomEventEnum} from "../../../InfiniteCanvas/ZoomControl/ZoomEvent/zoom-event-enum.enum";
import {DrawingLayerManagerService} from '../../../InfiniteCanvas/DrawingLayerManager/drawing-layer-manager.service';

export class Cursor {
  private group: Group;
  private readonly pointer: CompoundPath;
  private readonly userName: PointText;
  private zoomEventEmitter;

  private layerService:DrawingLayerManagerService;

  private width: number;
  private height: number;

  constructor(color: Color, zoomEventEmitter: EventEmitter<any>, layerService) {
    const cursorPath = "M4 0l16 12.279-6.78 1.138 4.256 8.676-3.902 1.907-4.281-8.758-5.293 4.581z";
    this.zoomEventEmitter = zoomEventEmitter;
    this.layerService = layerService;

    this.pointer = new CompoundPath(cursorPath);
    this.pointer.fillColor = color;

    this.userName = new PointText(this.pointer.bounds.bottomRight);
    this.userName.fillColor = color;

    this.group = new Group();
    this.group.addChild(this.pointer);
    this.group.addChild(this.userName);

    this.group.shadowColor = new Color("grey");
    this.group.shadowBlur = 10;
    this.group.shadowOffset = new Point(1,1);

    this.layerService.cursorTrackerPaperProject.activeLayer.addChild(this.group);

    this.group.bounds.width = this.group.bounds.width / this.layerService.currentZoomFactor;
    this.group.bounds.height = this.group.bounds.height / this.layerService.currentZoomFactor;

    zoomEventEmitter.subscribe((zoomEvent: ZoomEvent) => {
      this.onZoomChanged(zoomEvent);
    });
  }

  public setName(name: string) {
    this.userName.content = name;

    this.width = this.group.bounds.width;
    this.height = this.group.bounds.height;


  }

  private isMoving = false;
  public moveTo(point: Point) {
    if (!this.isMoving) {
      this.isMoving = true;
      /*if(point.x === this.group.position.x && point.y === this.group.position.y){
        return;
      }*/
      this.group.tween({
        'bounds.topLeft': point
      }, {
        easing: 'linear',
        duration: 100,
      }).then(() => {
        this.isMoving = false;
      });
      this.group.bringToFront();
    }
  }

  public remove() {
    this.group.removeChildren();
    this.group.remove();
  }

  private onZoomChanged(zoomEvent: ZoomEvent) {
    switch (zoomEvent.action) {
      case ZoomEventEnum.ZOOM_CHANGED:
        this.refreshCursorSizeForZooming(zoomEvent.zoomFactor);
        break;
      case ZoomEventEnum.ZOOM_IN:
        break;
      case ZoomEventEnum.ZOOM_OUT:
        break;
      default:
        break;
    }
  }

  private refreshCursorSizeForZooming(factor: number) {
    this.group.bounds.width = this.width / factor;
    this.group.bounds.height = this.height / factor;
  }

  public getPaperInstance(){
    return this.group;
  }
}
