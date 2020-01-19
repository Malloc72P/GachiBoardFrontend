import { Injectable } from '@angular/core';
import * as paper from 'paper';
import {PositionCalcService} from "../../PositionCalc/position-calc.service";
import {DataType} from '../../../Helper/data-type-enum/data-type.enum';
import {InfiniteCanvasService} from '../../InfiniteCanvas/infinite-canvas.service';
import {DrawingLayerManagerService} from '../../InfiniteCanvas/DrawingLayerManager/drawing-layer-manager.service';
import {WhiteboardItem} from '../../Whiteboard-Item/whiteboard-item';

@Injectable({
  providedIn: 'root'
})
export class EraserService {
  private strokeWidth = 10;
  private newPath: paper.Path;
  private currentProject: paper.Project;

  private hitOptions = {
    segments: true,
    stroke: true,
    fill: true,
    tolerance: 5
  };

  constructor(
    private posCalcService: PositionCalcService,
    private layerService:DrawingLayerManagerService,
  ) { }

  public initializeEraserService(project: paper.Project) {
    this.currentProject = project;
  }

  public setWidth(value: number) {
    this.strokeWidth = value;
  }

  public createPath(event) {
    let point: paper.Point;

    if(this.newPath){
      this.endPath();
    }

    if(event instanceof MouseEvent) {
      point = new paper.Point(event.x, event.y);
    } else if (event instanceof TouchEvent) {
      point = new paper.Point(event.touches[0].clientX, event.touches[0].clientY);
    } else {
      return;
    }
    point = this.posCalcService.advConvertNgToPaper(point);
    this.newPath = new paper.Path({
      segments: [new paper.Point(point.x, point.y)],
      strokeWidth: this.strokeWidth,
      strokeColor: 'lightgray',
      strokeCap: 'round',
      strokeJoin: 'round',
    });
    this.newPath.data.type = DataType.EREASER;
    this.removeProcess(point);
  }
  public drawPath(event) {
    let point: paper.Point;

    if(event instanceof MouseEvent) {
      point = new paper.Point(event.x, event.y);
    } else if (event instanceof TouchEvent) {
      point = new paper.Point(event.touches[0].clientX, event.touches[0].clientY);
    } else {
      return;
    }
    point = this.posCalcService.advConvertNgToPaper(point);
    this.newPath.add(new paper.Point(point.x, point.y));
    this.removeProcess(point);
  }
  public endPath() {
    this.newPath.remove();
  }

  private removeProcess(point:paper.Point) {

    let foundItem:WhiteboardItem = this.layerService.getHittedItem(point);
    if(foundItem){
      foundItem.destroyItem();
    }
    if(this.newPath.segments.length > 20){
      this.newPath.removeSegments(this.newPath.firstSegment.index,this.newPath.lastSegment.index - 20);
    }
  }
}
