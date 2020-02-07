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
  NOT_THING,
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

  private action: NORMAL_POINTER_ACTIONS;
  private _isMultipleSelectMode = false;

  private prevTouchPoint = new Point(0,0);
  private prevPoint = new Point(0,0);

  private selectedHandle;

  constructor(
    private posCalcService        : PositionCalcService,
    private infiniteCanvasService : InfiniteCanvasService,
    private layerService    : DrawingLayerManagerService,

  ) {
  }


  public initializeNormalPointerService( currentProject: Project ){
    this.currentProject = currentProject;
  }

  // ##############################################
  // ################ onMouseDown #################
  // ##############################################

  public onMouseDown(event){

    // 선택된 아이템이 없음
    if(!this.layerService.isSelecting){
      // 아이템 선택 시도
      if(this.isItemHit(event.point)) {
      }
      // 아이템 선택 실패 - 캔버스 이동
      this.initDelta(event.event);
      // this.moveCanvas(event);
    } else {
      // 핸들러 선택 시도
      if(this.isHandlerHit(event.point)) {
        // 선택 성공함 -> 아이템 핸들링 모드로 변경
        this.selectedHandle.onMouseDown(event);
        this.action = NORMAL_POINTER_ACTIONS.HANDLING_iTEM;
        return;
      }

      // 링크포트 선택 시도
      if(this.isLinkPortHit(event.point)) {
        // 선택 성공함 -> 링크 수정 모드로 변경
        this.selectedHandle.onMouseDown(event);
        this.action = NORMAL_POINTER_ACTIONS.LINK_EDITING;
        return;
      }

      // 아이템 선택 시도
      if(this.itemSelect(event)) {
        // 선택 성공함 -> 드래그 안하고 선택 해제도 안함
        return;
      }
      // GSG의 영역으로 시작 (아이템 드래그)
      if(this.isHitGSG(event.point)) {
        this.action = NORMAL_POINTER_ACTIONS.DRAGGING_ITEM;
      } else {
      // GSG 영역 밖에서 시작 (선택 해제)
        this.layerService.globalSelectedGroup.extractAllFromSelection();
      }
    }
  }

  // ##############################################
  // ################ onMouseMove #################
  // ##############################################

  public onMouseMove(event){
    if(!this.layerService.isSelecting){
      this.moveCanvas(event);
    } else {
      if(this.action === NORMAL_POINTER_ACTIONS.DRAGGING_ITEM) {
        this.layerService.globalSelectedGroup.moveTo(event);
      }
      if(this.action === NORMAL_POINTER_ACTIONS.HANDLING_iTEM || this.action === NORMAL_POINTER_ACTIONS.LINK_EDITING) {
        this.selectedHandle.onMouseDrag(event);
      }
    }
  }

  // ##############################################
  // ################# onMouseUp ##################
  // ##############################################

  public onMouseUp(event){
    if(!this.layerService.isSelecting){
      // this.moveCanvas(event);
    } else {
      if(this.action === NORMAL_POINTER_ACTIONS.DRAGGING_ITEM) {
        this.layerService.globalSelectedGroup.moveEnd();
      }
      if(this.action === NORMAL_POINTER_ACTIONS.HANDLING_iTEM || this.action === NORMAL_POINTER_ACTIONS.LINK_EDITING) {
        this.selectedHandle.onMouseUp(event);
      }
    }
    this.action = NORMAL_POINTER_ACTIONS.NOT_THING;
    this.isMultipleSelectMode = false;
  }

  public onTouchStart(event){
    this.prevTouchPoint = this.posCalcService.reflectZoomWithPoint(
      new Point(event.touches[0].clientX, event.touches[0].clientY)
    );

  }
  public onTouchMove(event){
    if(!this.layerService.isSelecting){
      this.movedByTouch(event);
    }
  }
  public onTouchEnd(event){
    if(!this.layerService.isSelecting){
      this.movedByTouch(event);
    }
  }

  private isHandlerHit(point): boolean {
    let handle = this.layerService.getHittedItemHandler(point);

    if(!!handle) {
      this.selectedHandle = handle;
      return true;
    }
    return false;
  }

  private isLinkPortHit(point): boolean {
    let port = this.layerService.getHittedLinkPort(point);

    if(!!port) {
      this.selectedHandle = port;
      return true;
    }
    return false;
  }

  private isItemHit(point): boolean {
    let hitItem = this.layerService.getHittedItem(point);

    if(hitItem) {
      this.layerService.globalSelectedGroup.insertOneIntoSelection(hitItem);
      return true;
    } else {
      return false;
    }
  }

  private isHitGSG(point): boolean {
    return this.layerService.isHitGSG(point);
  }

  private itemSelect(event): boolean {
    let hitItem = this.layerService.getHittedItem(event.point);

    // hitItem 있음
    if(!!hitItem) {
      // 컨트롤, 쉬프트 안누르고 있는 상태
      if(event.modifiers.control !== true && event.modifiers.shift !== true) {
        // GSG에 있는 객체 잡음 (드래그 및 선택 해제 로직으로 넘어감)
        if(this.isHitGSG(event.point)) {
          return false;
        }

        // GSG에 없는 객체 잡음 (단일 선택)
        this.layerService.globalSelectedGroup.extractAllFromSelection();
        this.layerService.globalSelectedGroup.insertOneIntoSelection(hitItem);

        return true;
      }

      // 컨트롤, 쉬프트 누르고 있는 상태 (다중 선택)
      if(this.layerService.globalSelectedGroup.amIAlreadyHaveThis(hitItem)) {
        this.layerService.globalSelectedGroup.removeOneFromGroup(hitItem);
      } else {
        this.layerService.globalSelectedGroup.insertOneIntoSelection(hitItem);
      }
      return true;
    }
    return false;
  }

  public moveCanvas(event) {
    let delta = this.initDelta(event.event);
    console.log("NormalPointerService >> moveCanvas >> delta : ", delta);

    this.infiniteCanvasService.moveWithDelta(delta);
    this.infiniteCanvasService.solveDangerState();
  }

  private initDelta(html5Event: MouseEvent | TouchEvent): Point{
    let delta: Point;

    if(html5Event instanceof MouseEvent) {
      delta = new Point(html5Event.movementX, html5Event.movementY);
      this.prevPoint.x = html5Event.x;
      this.prevPoint.y = html5Event.y;
    } else {
      delta = new Point(html5Event.touches[0].clientX - this.prevPoint.x, html5Event.touches[0].clientY - this.prevPoint.y);
      this.prevPoint.x = html5Event.touches[0].clientX;
      this.prevPoint.y = html5Event.touches[0].clientY;
    }

    return delta;
  }

  public canvasMovedByMouse(event){
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

  set isMultipleSelectMode(value: boolean) {
    this._isMultipleSelectMode = value;
  }

  get isMultipleSelectMode(): boolean {
    return this._isMultipleSelectMode;
  }
}
