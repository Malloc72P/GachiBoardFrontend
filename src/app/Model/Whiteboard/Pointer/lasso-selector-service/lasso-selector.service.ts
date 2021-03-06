import * as paper from 'paper';
// @ts-ignore
import Group = paper.Group;
// @ts-ignore
import Point = paper.Point;
// @ts-ignore
import Item = paper.Item;

import { Injectable } from '@angular/core';
import {PositionCalcService} from "../../PositionCalc/position-calc.service";
import {DrawingLayerManagerService} from '../../InfiniteCanvas/DrawingLayerManager/drawing-layer-manager.service';
import {WhiteboardItem} from '../../Whiteboard-Item/whiteboard-item';
import {GlobalSelectedGroup} from '../../Whiteboard-Item/ItemGroup/GlobalSelectedGroup/global-selected-group';
import {ZoomEvent} from "../../InfiniteCanvas/ZoomControl/ZoomEvent/zoom-event";
import {NormalPointerService} from "../normal-pointer-service/normal-pointer.service";
import {LongTouch} from "../Pointer-Functions/long-touch";


@Injectable({
  providedIn: 'root'
})
export class LassoSelectorService {
  private newPath: paper.Path;
  private currentProject: paper.Project;
  private strokeWidth = 1;
  private dashLength = 5;

  private longTouch: LongTouch = new LongTouch();


  constructor(
    private posCalcService: PositionCalcService,
    private layerService: DrawingLayerManagerService,
    private normalPointer: NormalPointerService,
  ) {
    this.layerService.infiniteCanvasService.zoomEventEmitter.subscribe((zoomEvent: ZoomEvent) => {
      if(!!this.newPath) {
        let dashLength = this.dashLength / zoomEvent.zoomFactor;
        this.newPath.dashArray = [dashLength, dashLength];
        this.newPath.strokeWidth = this.strokeWidth / zoomEvent.zoomFactor;
      }
    });
  }

  public initializeLassoSelectorService(project: paper.Project) {
    this.currentProject = project;
  }

  public createPath(event) {
    // *선택이 되어있는지 확인
    // 선택 그룹이 있는지 확인
    if(!this.layerService.isSelecting){
      if(!this.isItemHit(event.point)) {
        this.createLassoPath(event.point);
      }
    } else {
      if(this.normalPointer.tryItemsHit(event)) {
        return;
      }
      if(this.normalPointer.tryDragging(event)) {
        this.longTouch.start(event, () => {
          this.layerService.contextMenu.openMenu(event.event);
        });
      }
      this.createLassoPath(event.point);
    }

    return;
  }

  public drawPath(event) {
    if(!this.layerService.isSelecting){
      this.newPath.add(event.point);
    } else {
      this.layerService.currentProject.view.autoUpdate = true;
      this.longTouch.stop(event);
      if(this.longTouch.longTouched) {
        return;
      }
      this.normalPointer.doDragging(event);
    }
  }

  public endPath(event) {
    if(this.newPath){
      this.newPath.closePath();
    }

    if(!this.layerService.isSelecting){
      this.selectBound();
    } else {
      this.longTouch.stop();
      this.longTouch.touchEnd();
      this.normalPointer.endDragging(event);
    }

    this.removeItem(this.newPath);
  }

  public onPinchZoomMove(){
    this.longTouch.stop()
  }

  private isItemHit(point): boolean {
    let hitItem = this.layerService.getHittedItem(point);
    if(hitItem && !hitItem.isOccupied) {
      this.layerService.globalSelectedGroup.insertOneIntoSelection(hitItem);
      return true;
    } else {
      return false;
    }
  }

  private selectBound() {
    let wbItems = this.layerService.whiteboardItemArray;
    let selection:Array<WhiteboardItem> = new Array<WhiteboardItem>();
    for(let i = 0; i < wbItems.length; i++){
      let wbItem = wbItems[i];
      if(wbItem instanceof GlobalSelectedGroup){
        continue
      }
      if(this.isInside(this.newPath, wbItem.group) && !wbItem.isOccupied){
        selection.push(wbItem);
      }
    }
    if (selection.length > 0) {
      this.layerService.globalSelectedGroup.insertMultipleIntoSelection(selection).then(()=>{});
    }
  }

  private isInside(selection, item) {
    return selection.contains(item.bounds.center);
  }
  private removeItem(item:Item){
    if(item){
      item.remove();
    }
  }
  public removeLassoPath(){
    this.removeItem(this.newPath);
  }
  private createLassoPath(point){
    this.removeLassoPath();
    let zoomFactor = this.posCalcService.getZoomState();
    if(this.newPath){
      this.newPath.remove();
    }
    this.newPath = new paper.Path({
      segments: [point],
      strokeColor: 'blue',
      strokeCap: 'round',
      strokeJoin: 'round',
      dashArray: [this.dashLength / zoomFactor, this.dashLength / zoomFactor],
      strokeWidth: this.strokeWidth / zoomFactor,
      data : { wbID : 1 }
    });
    this.layerService.tempProject.activeLayer.addChild(this.newPath);
  }
}
