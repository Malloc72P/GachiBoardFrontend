import * as paper from 'paper';
// @ts-ignore
import Point = paper.Point;
// @ts-ignore
import Project = paper.Project;

import {Injectable} from '@angular/core';
import {PositionCalcService} from '../../PositionCalc/position-calc.service';
import {InfiniteCanvasService} from '../../InfiniteCanvas/infinite-canvas.service';
import {DrawingLayerManagerService} from '../../InfiniteCanvas/DrawingLayerManager/drawing-layer-manager.service';


enum NORMAL_POINTER_ACTIONS{
  NOT_THING,
  DRAGGING_ITEM,
  HANDLING_ITEM,
  MOVING,
  LINK_ADDING,
  LINK_EDITING,
}

@Injectable({
  providedIn: 'root'
})
export class NormalPointerService {
  private currentProject: Project;

  private action: NORMAL_POINTER_ACTIONS;

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
      // 이 MouseDown 이 어떤 아이템을 Hit 했는지 찾아봄
      if(this.tryItemsHit(event)) {
        return;
      }

      // GSG 의 영역을 Hit 해서 드래깅을 해야할지 선택 취소를 해야할지 체크
      if(!this.tryDragging(event)) {
        this.initDelta(event.event);
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
      this.doDragging(event);
    }
  }

  // ##############################################
  // ################# onMouseUp ##################
  // ##############################################

  public onMouseUp(event){
    if(!this.layerService.isSelecting){
      // this.moveCanvas(event);
    } else {
      this.endDragging(event);
    }
  }

  // ###### Public Method To Reuse #######
  // lasso Selector 에서 사용중

  public tryItemsHit(event): boolean {
    // 핸들러 선택 시도
    if(this.isHandlerHit(event.point)) {
      // 선택 성공함 -> 아이템 핸들링 모드로 변경
      this.selectedHandle.onMouseDown(event);
      this.action = NORMAL_POINTER_ACTIONS.HANDLING_ITEM;
      return true;
    }

    // 링크포트 선택 시도
    if(this.isLinkPortHit(event.point)) {
      // 선택 성공함 -> 링크 추가 모드로 변경
      this.selectedHandle.onMouseDown(event);
      this.action = NORMAL_POINTER_ACTIONS.LINK_ADDING;
      return true;
    }

    // 링크 핸들러 선택 시도
    if(this.isLinkHandlerHit(event.point)) {
      // 선택 성공함 -> 링크 수정 모드로 변경
      this.selectedHandle.onMouseDown(event);
      this.action = NORMAL_POINTER_ACTIONS.LINK_EDITING;
      return true;
    }

    // 아이템 선택 시도
    if(this.itemSelect(event)) {
      // 선택 성공함 -> 드래그 안하고 선택 해제도 안함
      return true;
    }
  }

  public tryDragging(event): boolean {
    // GSG의 영역으로 시작 (아이템 드래그)
    if(this.isHitGSG(event.point)) {
      this.action = NORMAL_POINTER_ACTIONS.DRAGGING_ITEM;
      return true;
    }
    // GSG 영역 밖에서 시작 (선택 해제)
    this.layerService.globalSelectedGroup.extractAllFromSelection();
    return false;
  }

  public doDragging(event) {
    if(this.action === NORMAL_POINTER_ACTIONS.DRAGGING_ITEM) {
      this.layerService.globalSelectedGroup.moveByDelta(event);
    }
    if(
      this.action === NORMAL_POINTER_ACTIONS.HANDLING_ITEM ||
      this.action === NORMAL_POINTER_ACTIONS.LINK_ADDING ||
      this.action === NORMAL_POINTER_ACTIONS.LINK_EDITING
    ) {
      this.selectedHandle.onMouseDrag(event);
    }
  }

  public endDragging(event) {
    if(this.action === NORMAL_POINTER_ACTIONS.DRAGGING_ITEM) {
      this.layerService.globalSelectedGroup.moveEnd();
    }
    if(
      this.action === NORMAL_POINTER_ACTIONS.HANDLING_ITEM ||
      this.action === NORMAL_POINTER_ACTIONS.LINK_ADDING ||
      this.action === NORMAL_POINTER_ACTIONS.LINK_EDITING
    ) {
      this.selectedHandle.onMouseUp(event);
    }
    this.action = NORMAL_POINTER_ACTIONS.NOT_THING;
  }

  // #####################################

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

  private isLinkHandlerHit(point): boolean {
    let handle = this.layerService.getHittedLinkHandler(point);

    if(!!handle) {
      this.selectedHandle = handle;
      return true;
    }
    return false;
  }

  private isItemHit(point): boolean {
    let hitItem = this.layerService.getHittedItem(point, null, true);

    if(!!hitItem) {
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
    // 컨트롤, 쉬프트 안누르고 있는 상태
    if(
      event.modifiers.control !== true && event.modifiers.shift !== true &&
      event.modifiers.command !== true
    ) {
      return this.selectSingleItem(event);
    }

    // 컨트롤, 쉬프트 누르고 있는 상태 (다중 선택)
    return this.selectMultipleItem(event);
  }

  private selectSingleItem(event) {
    let hitItem = this.layerService.getHittedItem(event.point, null, true);

    if(!!hitItem) {
      // GSG 에 있는 객체 잡음 (드래그 및 선택 해제 로직으로 넘어감)
      if(this.isHitGSG(event.point)) {
        return false;
      }

      // GSG 에 없는 객체 잡음 (단일 선택)
      this.layerService.globalSelectedGroup.extractAllFromSelection();
      this.layerService.globalSelectedGroup.insertOneIntoSelection(hitItem);

      return true;
    }
  }

  private selectMultipleItem(event) {
    let hitItem = this.layerService.getHittedItem(event.point, null, false);

    // hitItem 이 없거나 링크가 선택되어있으면 선택 안함
    if(!!hitItem && !this.layerService.globalSelectedGroup.isLinkSelected) {
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

    this.infiniteCanvasService.moveWithDelta(delta);
    this.infiniteCanvasService.solveDangerState();
  }

  private initDelta(html5Event: MouseEvent | TouchEvent): Point{
    let delta: Point;

    if(html5Event instanceof MouseEvent) {
      delta = new Point(html5Event.x - this.prevPoint.x, html5Event.y - this.prevPoint.y);
      this.prevPoint.x = html5Event.x;
      this.prevPoint.y = html5Event.y;
    } else {
      delta = new Point(html5Event.touches[0].clientX - this.prevPoint.x, html5Event.touches[0].clientY - this.prevPoint.y);
      this.prevPoint.x = html5Event.touches[0].clientX;
      this.prevPoint.y = html5Event.touches[0].clientY;
    }

    return this.posCalcService.reflectZoomWithPoint(delta);
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
}
