import { Injectable } from '@angular/core';

// @ts-ignore
import Path = paper.Path;
// @ts-ignore
import Point = paper.Point;
// @ts-ignore
import PointText = paper.PointText;
// @ts-ignore
import Group = paper.Group;
// @ts-ignore
import Project = paper.Project;
// @ts-ignore
import Rectangle = paper.Path.Rectangle;
// @ts-ignore
import Circle = paper.Path.Circle;
// @ts-ignore
import Layer = paper.Layer;
import * as paper from "paper";
import {PositionCalcService} from '../../PositionCalc/position-calc.service';
import {InfiniteCanvasService} from '../../InfiniteCanvas/infinite-canvas.service';
import {LassoSelectorService} from '../lasso-selector-service/lasso-selector.service';
import {DrawingLayerManagerService} from '../../InfiniteCanvas/DrawingLayerManager/drawing-layer-manager.service';

enum NORMAL_POINTER_ACTIONS{
  SELECTED,
  DRAGGING_ITEM,
  HANDLING_iTEM,
  MOVING
}

@Injectable({
  providedIn: 'root'
})
export class NormalPointerService {
  private currentProject: Project;
  private action;
  private prevNgPoint = new Point(0,0);
  //이 변수는 줌 배율만 반영됨
  //paper좌표로 변환되면 안됨

  private prevPoint = new Point(0,0);
  private trailDistance = 0;

  constructor(
    private positionCalcService   : PositionCalcService,
    private infiniteCanvasService : InfiniteCanvasService,
    private posCalcService        : PositionCalcService,
    private lassoService  : LassoSelectorService,
    private layerService  : DrawingLayerManagerService,
  ) {
    this.action = NORMAL_POINTER_ACTIONS.MOVING;
  }


  public initializeNormalPointerService( currentProject: Project ){
    this.currentProject = currentProject;
  }

  public onMouseDown(event){
    this.prevPoint = this.posCalcService.downEventToPaperPoint(event);
    this.onDown(event);
  }
  public onMouseMove(event){
    this.calcCurrentDistance(event);
    this.onMove(event);
  }
  public onMouseUp(event){
    this.calcCurrentDistance(event);
    this.onUp(event);
    this.resetDistance();
  }

  public onTouchStart(event){
    this.prevNgPoint = this.posCalcService.reflectZoomWithPoint(
      new Point(event.touches[0].clientX, event.touches[0].clientY)
    );

    this.prevPoint = this.posCalcService.downEventToPaperPoint(event);
    this.onDown(event);
  }
  public onTouchMove(event){
    this.calcCurrentDistance(event);
    this.onMove(event);
  }
  public onTouchEnd(event){
    this.calcCurrentDistance(event);
    this.onUp(event);
    this.resetDistance();
  }



  private onDown(event){
    let point = this.posCalcService.downEventToPaperPoint(event);
    let hitItem = this.layerService.getHittedItem(point);

    if(this.lassoService.isSelectionEmpty()){
      //선택된 개체 없음
      if(hitItem){
        //선택된 개체는 없지만 hitTest 성공
        this.setSelectedMode(hitItem);
      }else{//hitTest 실패, 이동모드
        this.setMovingMode();
      }//hitTest 실패, 이동모드 ###
    }else{//선택된 개체 존재
      let selectedItem = this.lassoService.getFirstOfSelectedGroup();
      if(selectedItem){//선택된 개체가 사용가능하다면
        let hitHandler = this.lassoService.getHittedHandler(point);
        console.log("NormalPointerService >> onDown >> hitHandler : ",hitHandler);
        if(hitHandler){//반응한 핸들러가 존재한다면, 핸들링 아이템모드 실행
          console.log("링크포트 빌더모드 실행하기");
          //TODO 링크포트 빌더코드는 여기서 작성
          this.setHandlingItemMode(hitHandler, point);
        }else{//반응한 핸들러가 없으면서...
          if(hitItem && hitItem.id === selectedItem.id){//selectedItem 안의 영역을 클릭한 경우
            //드래그모드 실행
            this.setDraggingItemMode( event );
          }else{//특수이동절차로 진입
            // Case 1 : 이동거리가 일정치보다 작다면 >>> LassoService에서 개체선택해제
            // Case 2 : 이동거리가 일정치보다 크다면 >>> 아무것도 안하고 이동만 함
            console.log("NormalPointerService >> onDown >> 특수이동절차로");
            this.setMovingMode();
          }
        }//반응한 핸들러가 없다면, 드래그모드 실행 ###
      }else{//선택된 개체가 사용불가능한 ERROR상황
        console.warn("NormalPointerService >> onDown >> 에러상황! 선택된 개체가 존재하지만 가져오지 못했음");
      }//선택된 개체가 사용불가능한 ERROR상황 ###
    }//선택된 개체 존재 ###
  }//onDown ###

  private onMove(event){
    switch (this.action) {
      case NORMAL_POINTER_ACTIONS.SELECTED:
        break;
      case NORMAL_POINTER_ACTIONS.MOVING:
        this.moveTo(event);
        break;
      case NORMAL_POINTER_ACTIONS.DRAGGING_ITEM:
        this.lassoService.drawPath(event);
        break;
      case NORMAL_POINTER_ACTIONS.HANDLING_iTEM:
        this.lassoService.drawPath(event);
        break;
      default:
    }
  }
  private onUp(event){
    switch (this.action) {
      case NORMAL_POINTER_ACTIONS.SELECTED:
        break;
      case NORMAL_POINTER_ACTIONS.MOVING:
        this.moveTo(event);
        if(!this.lassoService.isSelectionEmpty()){
          this.manageItemSelectionCancel();
        }
        break;
      case NORMAL_POINTER_ACTIONS.DRAGGING_ITEM:
        this.lassoService.endPath(event);
        break;
      case NORMAL_POINTER_ACTIONS.HANDLING_iTEM:
        this.lassoService.endPath(event);
        break;
      default:
    }

  }

  public moveTo(event){
    if(event instanceof MouseEvent) {
      let delta = this.positionCalcService.reflectZoomWithPoint(
        new Point( -event.movementX, -event.movementY )
      );
      // @ts-ignore
      paper.view.scrollBy(delta);
      this.infiniteCanvasService.solveDangerState();
    }
    else if (event instanceof TouchEvent) {
      let endPoint = this.posCalcService.reflectZoomWithPoint(
        new Point( event.changedTouches[0].clientX, event.changedTouches[0].clientY )
      );
      let calcX = endPoint.x - this.prevNgPoint.x ;
      let calcY = endPoint.y - this.prevNgPoint.y ;

      let delta = new Point( -calcX, -calcY );

      // @ts-ignore
      paper.view.scrollBy(delta);
      this.infiniteCanvasService.solveDangerState();

      this.prevNgPoint.x = endPoint.x;
      this.prevNgPoint.y = endPoint.y;
    }
  }
  private setMovingMode(){
    this.action = NORMAL_POINTER_ACTIONS.MOVING;
  }
  private setDraggingItemMode(event){
    let point = this.posCalcService.eventToPoint(event);

    this.action = NORMAL_POINTER_ACTIONS.DRAGGING_ITEM;
    this.lassoService.setDraggingItemMode(point);

  }
  private setHandlingItemMode(hitHandler, point){
    this.action = NORMAL_POINTER_ACTIONS.HANDLING_iTEM;
    this.lassoService.setResizingMode(hitHandler, point);

  }
  private setSelectedMode(selectedWbItem){
    this.action = NORMAL_POINTER_ACTIONS.SELECTED;
    this.lassoService.addItemIntoSelectedGroup(selectedWbItem);
  }
  private calcCurrentDistance(event){
    let point = this.posCalcService.moveEventToPaperPoint(event);
    let currentDistance = this.posCalcService.calcPointDistanceOn2D(point, this.prevPoint);
    this.trailDistance += currentDistance;
  }
  private resetDistance(){
    this.trailDistance = 0;
  }
  private manageItemSelectionCancel(){
    if(this.trailDistance < 5){
      this.lassoService.cancelSelect();
    }
  }
}
