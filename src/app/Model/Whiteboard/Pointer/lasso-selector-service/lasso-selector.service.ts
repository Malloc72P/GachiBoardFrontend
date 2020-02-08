import { Injectable } from '@angular/core';
import * as paper from 'paper';
import {PositionCalcService} from "../../PositionCalc/position-calc.service";
import {DataName, DataState, DataType, ItemName} from '../../../Helper/data-type-enum/data-type.enum';
import {DrawingLayerManagerService} from '../../InfiniteCanvas/DrawingLayerManager/drawing-layer-manager.service';
import {InfiniteCanvasService} from '../../InfiniteCanvas/infinite-canvas.service';
import {WhiteboardItem} from '../../Whiteboard-Item/whiteboard-item';

// @ts-ignore
import Group = paper.Group;
// @ts-ignore
import Point = paper.Point;
// @ts-ignore
import Item = paper.Item;
import {LinkPort} from '../../Whiteboard-Item/Whiteboard-Shape/LinkPort/link-port';
import {PointCalculator} from "../point-calculator/point-calculator";
import {WhiteboardShape} from "../../Whiteboard-Item/Whiteboard-Shape/whiteboard-shape";
import {EditableItemGroup} from '../../Whiteboard-Item/ItemGroup/EditableItemGroup/editable-item-group';
import {ItemGroup} from '../../Whiteboard-Item/ItemGroup/item-group';
import {GlobalSelectedGroup} from '../../Whiteboard-Item/ItemGroup/GlobalSelectedGroup/global-selected-group';
import {ZoomEvent} from "../../InfiniteCanvas/ZoomControl/ZoomEvent/zoom-event";


@Injectable({
  providedIn: 'root'
})
export class LassoSelectorService {
  private newPath: paper.Path;
  private currentProject: paper.Project;
  private strokeWidth = 1;
  private dashLength = 5;


  constructor(
    private posCalcService: PositionCalcService,
    private layerService: DrawingLayerManagerService,
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
      this.createLassoPath(event.point);
    }

    return;
  }

  public drawPath(event) {
    if(!this.layerService.isSelecting){

      this.newPath.add(event.point);
    }
  }

  public endPath(event) {
    if(this.newPath){
      this.newPath.closePath();
    }

    if(!this.layerService.isSelecting){
      this.selectBound();
    }

    this.removeItem(this.newPath);
  }

  private selectBound() {
    let wbItems = this.layerService.whiteboardItemArray;
    for(let i = 0; i < wbItems.length; i++){
      let wbItem = wbItems[i];
      if(wbItem instanceof GlobalSelectedGroup){
        continue
      }
      if(this.isInside(this.newPath, wbItem.group)){
        this.layerService.globalSelectedGroup.insertOneIntoSelection(wbItem);
      }
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

  }
}
