import {Injectable} from '@angular/core';
import * as paper from 'paper';
import {PositionCalcService} from '../../PositionCalc/position-calc.service';
import {InfiniteCanvasService} from '../../InfiniteCanvas/infinite-canvas.service';
import {LassoSelectorService} from '../lasso-selector-service/lasso-selector.service';
import {DrawingLayerManagerService} from '../../InfiniteCanvas/DrawingLayerManager/drawing-layer-manager.service';
import {DataType} from '../../../Helper/data-type-enum/data-type.enum';
import {LinkPort} from '../../Whiteboard-Item/Whiteboard-Shape/LinkPort/link-port';

// @ts-ignore
import Point = paper.Point;
// @ts-ignore
import Project = paper.Project;
import {WhiteboardShape} from '../../Whiteboard-Item/Whiteboard-Shape/whiteboard-shape';
import {WhiteboardItem} from '../../Whiteboard-Item/whiteboard-item';
import {CanvasMoverService} from '../CanvasMover/canvas-mover.service';

enum NORMAL_POINTER_ACTIONS{
  SELECTED,
  DRAGGING_ITEM,
  HANDLING_iTEM,
  MOVING,
  LINK_EDITING
}

@Injectable({
  providedIn: 'root'
})
export class NormalPointerService {
  private currentProject: Project;
  private action;
  private prevTouchPoint = new Point(0,0);

  private prevPoint = new Point(0,0);


  constructor(
    private posCalcService        : PositionCalcService,
    private canvasMoverService    : CanvasMoverService,
    private layerService    : DrawingLayerManagerService,

  ) {
    this.action = NORMAL_POINTER_ACTIONS.MOVING;
  }


  public initializeNormalPointerService( currentProject: Project ){
    this.currentProject = currentProject;
  }

  public onMouseDown(event){
    if(!this.layerService.isSelecting()){
      this.canvasMoverService.movedByMouse(event);
    }
  }
  public onMouseMove(event){
    if(!this.layerService.isSelecting()){
      this.canvasMoverService.movedByMouse(event);
    }

  }
  public onMouseUp(event){
    if(!this.layerService.isSelecting()){
      this.canvasMoverService.movedByMouse(event);
    }

  }

  public onTouchStart(event){
    this.prevTouchPoint = this.posCalcService.reflectZoomWithPoint(
      new Point(event.touches[0].clientX, event.touches[0].clientY)
    );
  }
  public onTouchMove(event){
    if(!this.layerService.isSelecting()){
      this.canvasMoverService.movedByTouch(event);
    }
  }
  public onTouchEnd(event){
    if(!this.layerService.isSelecting()){
      this.canvasMoverService.movedByTouch(event);
    }
  }

  private onDown(event){
  }//onDown ###

  private onMove(event){
  }

  private onUp(event){
  }

}
