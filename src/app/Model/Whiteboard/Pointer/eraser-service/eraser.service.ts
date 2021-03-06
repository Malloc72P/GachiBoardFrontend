import { Injectable } from '@angular/core';
import {PositionCalcService} from "../../PositionCalc/position-calc.service";
import {DataType, WhiteboardItemType} from '../../../Helper/data-type-enum/data-type.enum';
import {InfiniteCanvasService} from '../../InfiniteCanvas/infinite-canvas.service';
import {DrawingLayerManagerService} from '../../InfiniteCanvas/DrawingLayerManager/drawing-layer-manager.service';
import {WhiteboardItem} from '../../Whiteboard-Item/whiteboard-item';

import * as paper from 'paper';
// @ts-ignore
import Item = paper.Item;
import {EditableLink} from "../../Whiteboard-Item/Whiteboard-Shape/LinkPort/EditableLink/editable-link";
import {WbItemWork} from '../../InfiniteCanvas/DrawingLayerManager/WorkHistoryManager/WbItemWork/wb-item-work';
import {ItemLifeCycleEnum} from '../../Whiteboard-Item/WhiteboardItemLifeCycle/WhiteboardItemLifeCycle';
import {WorkHistoryManager} from '../../InfiniteCanvas/DrawingLayerManager/WorkHistoryManager/work-history-manager';

@Injectable({
  providedIn: 'root'
})
export class EraserService {
  private strokeWidth = 10;
  private newPath: paper.Path;
  private currentProject: paper.Project;

  constructor(
    private posCalcService: PositionCalcService,
    private layerService:DrawingLayerManagerService,
  ) { }

  public initializeEraserService(project: paper.Project) {
    this.currentProject = project;
  }

  public createPath(event) {
    if(!!this.newPath){
      this.endPath();
    }

    this.createEraseStroke(event.point);
    this.removeProcess(event.point);
  }

  public drawPath(event) {
    this.newPath.add(event.point);
    setTimeout(() => {
      if(this.newPath && this.newPath.firstSegment) {
        this.newPath.firstSegment.remove();
      }
    }, 300);
    this.removeProcess(event.point);
  }

  public endPath() {
    this.newPath.remove();
  }

  private removeProcess(point:paper.Point) {

    let foundItem: WhiteboardItem | EditableLink = this.layerService.getHittedItem(point, this.strokeWidth / 2);
    if(foundItem) {
      if(this.itemChecker(foundItem)) {
        let wbItemWork = new WbItemWork(ItemLifeCycleEnum.DESTROY, foundItem.exportToDto());

        foundItem.destroyItem();

        let workHistoryManager = WorkHistoryManager.getInstance();
        workHistoryManager.pushIntoStack(wbItemWork);
      }
    }
    this.layerService.currentProject.view.update();
  }

  // 사용자 경험상 지우개로 지워지면 안될 화이트보드 아이템을 등록
  private itemChecker(wbItem: WhiteboardItem) {
    if(wbItem instanceof WhiteboardItem) {
      switch (wbItem.type) {
        case WhiteboardItemType.SIMPLE_RASTER:
        case WhiteboardItemType.EDITABLE_CARD:
        case WhiteboardItemType.EDITABLE_CIRCLE:
        case WhiteboardItemType.EDITABLE_RECTANGLE:
        case WhiteboardItemType.EDITABLE_TRIANGLE:
        case WhiteboardItemType.EDITABLE_LINK:
          return false;
        default:
          return true;
      }
    }
    return false;
  }

  private createEraseStroke(point) {
    this.newPath = new paper.Path({
      segments: [new paper.Point(point.x, point.y)],
      strokeWidth: this.strokeWidth,
      strokeColor: 'lightgray',
      strokeCap: 'round',
      strokeJoin: 'round',
    });
    this.layerService.tempProject.activeLayer.addChild(this.newPath);
  }

  set setWidth(value: number) {
    this.strokeWidth = value;
  }
}

