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


@Injectable({
  providedIn: 'root'
})
export class LassoSelectorService {
  private newPath: paper.Path;
  private previousPoint: paper.Point;
  private currentProject: paper.Project;
  private strokeWidth = 1;
  private dashLength = 5;


  constructor(
    private posCalcService: PositionCalcService,
    private layerService: DrawingLayerManagerService,
    private infiniteCanvasService: InfiniteCanvasService,
  ) {

  }

  public initializeLassoSelectorService(project: paper.Project) {
    this.currentProject = project;
  }

  public createPath(event) {

    let point: paper.Point;

    // 입력 타입에 맞게 필요한 값들 초기화
    if(event instanceof MouseEvent) {
      point = new paper.Point(event.x, event.y);
    } else if (event instanceof TouchEvent) {
      point = new paper.Point(event.touches[0].clientX, event.touches[0].clientY);
      this.previousPoint = new paper.Point(point);
    } else {
      return;
    }
    point = this.posCalcService.advConvertNgToPaper(point);
    // *선택이 되어있는지 확인
    // 선택 그룹이 있는지 확인
    if(!this.layerService.isSelecting()){
      this.createLassoPath(point);
    }

    return;
  }

  public drawPath(event) {
    let point: paper.Point;
    let delta: paper.Point;

    // 입력 타입에 맞게 필요한 값들 초기화
    if(event instanceof MouseEvent) {
      point = new paper.Point(event.x, event.y);
      delta = new paper.Point(event.movementX, event.movementY);
    } else if (event instanceof TouchEvent) {
      point = new paper.Point(event.touches[0].clientX, event.touches[0].clientY);
      delta = new paper.Point (point.x - this.previousPoint.x, point.y - this.previousPoint.y);
      this.previousPoint = new paper.Point(point);
    } else {
      return;
    }
    point = this.posCalcService.advConvertNgToPaper(point);

    if(!this.layerService.isSelecting()){
      this.newPath.add(point);
    }
    return;
  }

  public endPath(event) {
    let point: paper.Point;

    if(event instanceof MouseEvent) {
      point = new paper.Point(event.x, event.y);
    } else if (event instanceof TouchEvent) {
      point = new paper.Point(event.changedTouches[0].clientX, event.changedTouches[0].clientY);
      this.previousPoint = new paper.Point(point);
    } else {
      return;
    }
    this.newPath.closePath();

    if(!this.layerService.isSelecting()){
      this.selectBound();
    }
    LassoSelectorService.removeItem(this.newPath);
  }

  private selectBound() {
    let wbItems = this.layerService.whiteboardItemArray;
    for(let i = 0; i < wbItems.length; i++){
      let wbItem = wbItems[i];
      if(wbItem instanceof GlobalSelectedGroup){
        continue
      }
      if(LassoSelectorService.isInside(this.newPath, wbItem.group)){
        this.layerService.globalSelectedGroup.insertOneIntoSelection(wbItem);
      }
    }
  }

  private static isInside(selection, item) {
    return selection.contains(item.bounds.center);
  }
  private static removeItem(item:Item){
    if(item){
      item.remove();
    }
  }
  public removeLassoPath(){
    LassoSelectorService.removeItem(this.newPath);
  }
  private createLassoPath(point){
    this.removeLassoPath();
    let zoomFactor = this.infiniteCanvasService.zoomFactor;
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
