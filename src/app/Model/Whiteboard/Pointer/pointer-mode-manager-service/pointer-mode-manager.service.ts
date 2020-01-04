import { Injectable } from '@angular/core';
import {PointerMode} from '../pointer-mode-enum-service/pointer-mode-enum.service';

import {InfiniteCanvasService} from "../../InfiniteCanvas/infinite-canvas.service";

// @ts-ignore
import Tool = paper.Tool;
// @ts-ignore
import Point = paper.Point;
// @ts-ignore
import Path = paper.Path;

import * as paper from 'paper';

@Injectable({
  providedIn: 'root'
})

export class PointerModeManagerService {
  private readonly toolMap: Map<number, Tool>;
  private test = Tool;
  private currentPointerMode: number;

  constructor( private infiniteCanvasService:InfiniteCanvasService ) {
    this.toolMap = new Map<number, Tool>();
    this.initializeTool(this.toolMap);
  }

  // TODO : 레퍼런스인지 테스트 해봐야함. 여기서 문제 발생 가능성 있음
  private initializeTool(toolMap: Map<number, Tool>) {
    //toolMap.set(PointerMode.DRAW, this.createBrush());
    //toolMap.set(PointerMode.MOVE, this.createPointMover());
  }

  public activateTool(mode:number){
    this.currentPointerMode = mode;
    return this.toolMap.get(mode).activate();
  }

  private createBrush(): Tool{
    let newTool = new Tool();
    let newPath:Path;

    newTool.onMouseDown = (event) => {
      if(this.currentPointerMode === PointerMode.DRAW){
        // If we produced a path before, deselect it:
        if (newPath) {
          newPath.selected = false;
        }

        // Create a new path and set its stroke color to black:
        newPath = new Path({
          segments: [event.point],
          strokeColor: 'black',
          // Select the path, so we can see its segment points:
          //fullySelected: true
        });
      }
    };

    newTool.onMouseDrag = (event) => {
      if(this.currentPointerMode === PointerMode.DRAW){
        newPath.add(event.point);
      }
      else if(this.currentPointerMode === PointerMode.MOVE){
        //this.movingAlg(event);
      }
    };

    newTool.onMouseUp = () => {
      //let segmentCount = newPath.segments.length;

      // When the mouse is released, simplify it:
      newPath.simplify(2);
      //this.wbRelay.sendData(newPath.exportJSON());
      //this.wbRelay.sendDrawStrokeCreate(newPath.exportJSON());
      // this.wbRelay.drawsStrokeController.drawsStrokeCreate(newPath);
    };

    return newTool;
  }

  createPointMover(){
    let newTool = new Tool();
    let segment;//얘가 움직일 대상임.
    let adjustedPosition: Point;

    newTool.onMouseDown = (event)=>{
      /*//(1) 세그먼트 초기화
      segment = null;

      //(2) 히트테스트 실시
      let hitResult = this.currentProject.hitTest(event.point, this.hitOptions);

      //(3) 유효성검사 #####
      if (!hitResult){
        return;
      }
      if(!PointerModeManager.segmentVerifier(hitResult.item)){
        return
      }
      //##### 유효성검사

      //(4) 세그먼트 객체 얻어옴. 여기서 움직일 대상의 객체를 받아오는거임.
      segment = this.segmentParser(hitResult);
      if(!segment){
        return;
      }
      //(5) 어딜 잡고 움직여도 되도록 하기 위한 좌표조정값임.
      adjustedPosition = new Point( event.point.x- segment.bounds.center.x, event.point.y - segment.bounds.center.y );*/
    };
    newTool.onMouseMove = (event)=>{
      // this.currentProject.activeLayer.selected = false;
      // if (event.item){
      //   if(event.item.parent.name === 'mainframeMatrix'){
      //     return;
      //   }
      //   event.item.selected = true;
      // }
    };
    newTool.onMouseDrag = (event)=>{
      let delta = event.downPoint.subtract(event.point);
      this.infiniteCanvasService.movingAlg(delta);
      console.log("PointerModeManagerService >> onMouseDrag >> event.downPoint : ",event.downPoint);
      console.log("PointerModeManagerService >> onMouseDrag >> delta : ",delta);
      // @ts-ignore
      paper.view.scrollBy(delta);
      /*if(!PointerModeManager.segmentVerifier(segment)){//뭔가 안잡고 있는 경우엔 이동하고,
        this.movingAlg(event);
      } else{//잡고있는 경우엔 드래그함.
        PointerModeManager.advDraggier(segment, adjustedPosition, event.point);
      }*/
    };
    newTool.onMouseUp = (event)=>{//마우스를 땔때, 통신시도함.
      if(!PointerModeManagerService.segmentVerifier(segment)){
        let delta = event.downPoint.subtract(event.point);
        this.infiniteCanvasService.movingAlg(delta);
        // @ts-ignore
        paper.view.scrollBy(delta);
      }
      else{
        console.log("PointerModeManager >> onMouseUp >> segment : ",segment);
        PointerModeManagerService.advDraggier(segment, adjustedPosition, event.point);
        //this.sendWbItemMovementData(segment);
      }
    };
    return newTool;
  }

  private static segmentVerifier(segment){
    if(!segment){//hit했지만, item을 못불러온 경우 리턴
      return false;
    }
    if(!segment.parent){//item은 있지만, 부모레이어가 없는 경우 리턴
      return  false;
    }
    return segment.parent.name !== 'mainframeMatrix';
  }
  private static advDraggier(segment, adjustedPosition, newCoordinate){
    segment.position.x = newCoordinate.x - adjustedPosition.x;
    segment.position.y = newCoordinate.y - adjustedPosition.y;
  }
  private segmentParser(hitResult){
    let segment = null;
    //디버깅용. 해당 세그먼트의 타입이 뭔지 알기 위해 사용
    // if (hitResult !== null) {
    //   console.log("PointerModeManager >> segmentParser >> hitResult : ", hitResult.type);
    // }
    if (hitResult.type === 'segment') {//세그먼트를 선택한 경우
      //segment = hitResult.segment;
    }
    else if (hitResult.type === 'stroke') {//스트로크를 선택한 경우
      segment = hitResult.item;
    }
    else if(hitResult.type === 'pixel'){//레스터 이미지를 선택한 경우
      segment = hitResult.item;
    }
    else if(hitResult.type === 'fill'){//PointText를 선택한 경우
      segment = hitResult.item;
    }
    return segment;
  }



}
