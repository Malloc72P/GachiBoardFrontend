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
    private infiniteCanvasService : InfiniteCanvasService,
    private layerService    : DrawingLayerManagerService,

  ) {
  }


  public initializeNormalPointerService( currentProject: Project ){
    this.currentProject = currentProject;
  }

  public onMouseDown(event){
    if(!this.layerService.isSelecting()){
      this.movedByMouse(event);
    }
  }
  public onMouseMove(event){
    if(!this.layerService.isSelecting()){
      this.movedByMouse(event);
    }

  }
  public onMouseUp(event){
    if(!this.layerService.isSelecting()){
      this.movedByMouse(event);
    }

  }

  public onTouchStart(event){
    this.prevTouchPoint = this.posCalcService.reflectZoomWithPoint(
      new Point(event.touches[0].clientX, event.touches[0].clientY)
    );

  }
  public onTouchMove(event){
    if(!this.layerService.isSelecting()){
      this.movedByTouch(event);
    }
  }
  public onTouchEnd(event){
    if(!this.layerService.isSelecting()){
      this.movedByTouch(event);
    }
  }
  public movedByMouse(event){
    let delta = this.posCalcService.reflectZoomWithPoint(
      new Point( -event.movementX, -event.movementY )
    );
    this.infiniteCanvasService.moveWithDelta(delta);
    this.infiniteCanvasService.solveDangerState();
  }

  public movedByTouch(event){
    let endPoint = this.posCalcService.reflectZoomWithPoint(
      new Point( event.changedTouches[0].clientX, event.changedTouches[0].clientY )
    );
    let calcX = endPoint.x - this.prevTouchPoint.x ;
    let calcY = endPoint.y - this.prevTouchPoint.y ;

    let delta = new Point( -calcX, -calcY );

    // @ts-ignore
    this.infiniteCanvasService.moveWithDelta(delta);
    this.infiniteCanvasService.solveDangerState();

    this.prevTouchPoint.x = endPoint.x;
    this.prevTouchPoint.y = endPoint.y;
  }

}
