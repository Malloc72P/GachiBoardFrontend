import {EventEmitter, HostListener, Injectable, Output} from '@angular/core';

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
// @ts-ignore
import Size = paper.Size;

import * as paper from 'paper';
import {PositionCalcService} from "../PositionCalc/position-calc.service";
import {MinimapSyncService} from './MinimapSync/minimap-sync.service';
import {DataType} from '../../Helper/data-type-enum/data-type.enum';
import {DrawingLayerManagerService} from './DrawingLayerManager/drawing-layer-manager.service';
import {GlobalSelectedGroup} from '../Whiteboard-Item/ItemGroup/GlobalSelectedGroup/global-selected-group';
import {ZoomEvent} from './ZoomControl/ZoomEvent/zoom-event';
import {ZoomEventEnum} from './ZoomControl/ZoomEvent/zoom-event-enum.enum';

interface BoundaryObserver {
  position: Point;
}
interface whiteboardCell {
  id:number;
  cellData: Rectangle;
  cellGroup: Group;
  textInfo: PointText;
}

@Injectable({
  providedIn: 'root'
})
export class InfiniteCanvasService {
  private initFlag = false;

  private currentProject: Project;
  public whiteboardMatrix: Array<Array<whiteboardCell>>;
  public observerFamily: Map<string, BoundaryObserver>;
  private whiteboardRect;
  public whiteboardLayer:Layer;
  private isDrawingLayerExist = false;
  public drawingLayer: Layer;

  zoomDepth = 0;
  zoomRatio = 0.0;
  newZoom = 1;

  public readonly zoomFactor = 1.04;
  private readonly zoomInMax = 40;
  private readonly zoomOutMax = -40;

  private readonly gridLineStrokeColor = 'blue';
  private readonly gridLineOpacity = 0.1;

  private readonly gridStep = 100;



  private htmlCanvasWrapperObject: HTMLDivElement;

  @Output() zoomEventEmitter:EventEmitter<any> = new EventEmitter<any>();

  constructor(
    private posCalcService  : PositionCalcService,
    private minimapSyncService  : MinimapSyncService
  ) {

  }
  onWindowResized() {
    let bottomRight = this.posCalcService.getBottomRightPositionOfBrowser();
    this.currentProject.view.viewSize = new Size(bottomRight.x, bottomRight.y);
    this.resetInfiniteCanvas();
  }

  public initializeInfiniteCanvas(currentProject: Project){
    this.currentProject = currentProject;
    this.htmlCanvasWrapperObject
      = document.getElementById("canvasWrapper") as HTMLDivElement;
    this.initWhiteboardVariable();

    window.onresize = ()=>{
      this.onWindowResized()
    }
  }
  public initWhiteboardVariable( ){
    if(this.initFlag){
      // console.log("InfiniteCanvasService >> initializeInfiniteCanvas >> 이미 초기화됨 : ");
      return;
    }


    this.whiteboardLayer = new Layer();
    this.whiteboardLayer.data.type = DataType.INFINITE_CANVAS;
    this.whiteboardLayer.data.isMovable = false;

    this.posCalcService.initializePositionCalcService(this.currentProject);
    this.observerFamily = new Map<string, BoundaryObserver>();
    this.whiteboardMatrix = [
      [
        {id: 1, cellData: null, textInfo: null, cellGroup: null},
        {id: 2, cellData: null, textInfo: null, cellGroup: null},
        {id: 3, cellData: null, textInfo: null, cellGroup: null}
      ],
      [
        {id: 4, cellData: null, textInfo: null, cellGroup: null},
        {id: 5, cellData: null, textInfo: null, cellGroup: null},
        {id: 6, cellData: null, textInfo: null, cellGroup: null}
      ],
      [
        {id: 7, cellData: null, textInfo: null, cellGroup: null},
        {id: 8, cellData: null, textInfo: null, cellGroup: null},
        {id: 9, cellData: null, textInfo: null, cellGroup: null}
      ]
    ];
    this.whiteboardInitializer();
    this.initFlag = true;
    this.initializeDrawingLayer();
  }
  private whiteboardInitializer() {
    // console.log("InfiniteCanvasService >> whiteboardInitializer >> this.currentProject.view.bounds : ",this.currentProject.view.bounds);
    const gridStep: number = this.gridStep;
    let rect: paper.Rectangle = this.currentProject.view.bounds;

    let width = rect.width + gridStep - (rect.width % gridStep);
    let height = rect.height + gridStep - (rect.height % gridStep);

    for (let i = 0; i < 3; i++) {
      for (let j = 0; j < 3; j++) {
        let currentCell = this.whiteboardMatrix[j][i];
        currentCell.cellData = new Path.Rectangle(rect);
        currentCell.cellData.bounds.width = width;
        currentCell.cellData.bounds.height = height;
        let pivot: Point = new Point(currentCell.cellData.bounds.center);
        pivot.x -= width;
        pivot.y -= height;
        currentCell.cellData.position
          = new Point(pivot.x + width * i, pivot.y + height * j);

        currentCell.cellGroup = new Group();
        currentCell.cellGroup.addChild(currentCell.cellData);

        let topY = currentCell.cellData.bounds.topCenter.y;
        let bottomY = currentCell.cellData.bounds.bottomCenter.y;
        let leftX = currentCell.cellData.bounds.topLeft.x;
        let rightX = currentCell.cellData.bounds.topRight.x;

        let entryPoint = new Point( leftX - leftX % gridStep, topY - topY % gridStep );
        let exitPoint = new Point( rightX - rightX % gridStep, bottomY - bottomY % gridStep );

        for (let i = entryPoint.x; i <= exitPoint.x; i += gridStep) {
          let newLine = this.createGridLine();
          newLine.moveTo(new Point(i, entryPoint.y));
          newLine.lineTo(new Point(i, exitPoint.y));
          currentCell.cellGroup.addChild(newLine);
        }
        for (let i = entryPoint.y; i <= exitPoint.y; i += gridStep) {
          let newLine = this.createGridLine();
          newLine.moveTo(new Point(entryPoint.x, i));
          newLine.lineTo(new Point(exitPoint.x, i));
          currentCell.cellGroup.addChild(newLine);
        }
      }//for
    }
  }//WhiteboardInitializer

  createGridLine(){
    return new Path({
      strokeColor: this.gridLineStrokeColor,
      opacity: this.gridLineOpacity
    });
  }

  public solveDangerState(){
    let tempView = this.currentProject.view.bounds;

    let widthMargin = tempView.width/10;
    let heightMargin = tempView.height/10;

    let topObserver
      = this.whiteboardMatrix[0][1].cellData.bounds.topCenter.y     + heightMargin;
    let bottomObserver
      = this.whiteboardMatrix[2][1].cellData.bounds.bottomCenter.y  + heightMargin;
    let leftObserver
      = this.whiteboardMatrix[1][0].cellData.bounds.leftCenter.x    + widthMargin;
    let rightObserver
      = this.whiteboardMatrix[1][2].cellData.bounds.rightCenter.x   + widthMargin;

    let mutexObserverMover = true;

    let pos;

    //좌측 경계 검사
    pos = tempView.leftCenter;
    if(pos.x <= leftObserver){
      if (mutexObserverMover) {
        mutexObserverMover = false;
        console.log("영역 벗어남( left )");
        this.shiftRight();
      }
    }
    //우측 경계 검사
    pos = tempView.rightCenter;
    if(pos.x >= rightObserver){
      if (mutexObserverMover) {
        mutexObserverMover = false;
        console.log("영역 벗어남( right )");
        this.shiftLeft();
      }
    }
    //상단 경계 검사
    pos = tempView.topCenter;
    if(pos.y < topObserver){
      if(mutexObserverMover){
        mutexObserverMover = false;
        console.log("영역 벗어남( top )");
        this.shiftDown();
      }
    }
    //하단 경계 검사
    pos = tempView.bottomCenter;
    if(pos.y > bottomObserver){
      if (mutexObserverMover) {
        mutexObserverMover = false;
        console.log("영역 벗어남( up )");
        this.shiftUp();
      }
    }
  }

  private shiftDown() {
    console.log("InfiniteCanvasService >> shiftDown >> 진입함");
    this.whiteboardMatrix[2].forEach((vector: whiteboardCell) => {
      let cellHeight = vector.cellData.bounds.height;
      vector.cellGroup.position.y -= (cellHeight * 3) - this.gridStep;
      // vector.textInfo.position.y -= vector.cellGroup.bounds.height * 3;
    });
    this.whiteboardMatrix.unshift(this.whiteboardMatrix.pop());
  }
  private shiftUp() {
    console.log("InfiniteCanvasService >> shiftUp >> 진입함");
    this.whiteboardMatrix[0].forEach((vector: whiteboardCell) => {
      let cellHeight = vector.cellData.bounds.height;
      vector.cellGroup.position.y += (cellHeight * 3) - this.gridStep;
      // vector.textInfo.position.y += vector.cellGroup.bounds.height * 3;
    });
    this.whiteboardMatrix.push(this.whiteboardMatrix.shift());
  }
  private shiftRight() {
    console.log("InfiniteCanvasService >> shiftRight >> 진입함");
    this.whiteboardMatrix.forEach((vector) => {
      let tgtVector = vector[2] as whiteboardCell;
      //그리드의 실제 길이
      let cellWidth = tgtVector.cellData.bounds.width;
      tgtVector.cellGroup.position.x -= (cellWidth * 3) - this.gridStep;
    });
    this.whiteboardMatrix.forEach(function(v) {
      v.unshift(v.pop());
    });
  }
  private shiftLeft() {
    console.log("InfiniteCanvasService >> shiftLeft >> 진입함");
    this.whiteboardMatrix.forEach((vector) => {
      let tgtVector = vector[0] as whiteboardCell;
      //그리드의 실제 길이
      let cellWidth = tgtVector.cellData.bounds.width;
      tgtVector.cellGroup.position.x += (cellWidth * 3) - this.gridStep;
      // tgtVector.textInfo.position.x += tgtVector.cellGroup.bounds.width * 3;
    });
    this.whiteboardMatrix.forEach((v) => {
      v.push(v.shift());
    });
  }

  public changeZoom(oldZoom, ngCenter, ngMousePosition, delta){

    this.resetInfiniteCanvas();

    if (delta < 0 && this.zoomDepth < this.zoomInMax) {//Zoom In
      this.zoomDepth++;
      this.zoomRatio = this.zoomDepth * (this.zoomFactor - 1);
    } else if (delta > 0 && this.zoomDepth > this.zoomOutMax) {//Zoom Out
      this.zoomDepth--;
      this.zoomRatio = this.zoomDepth * (this.zoomFactor - 1);
    } else {
      return oldZoom;//한계인 경우 줌인/아웃 수행 X
    }

    let newCenter = new Point( this.currentProject.view.center.x,this.currentProject.view.center.y );

    let gapOfX = Math.abs(ngMousePosition.x - ngCenter.x) / this.currentProject.view.zoom;
    let gapOfY = Math.abs(ngMousePosition.y - ngCenter.y) / this.currentProject.view.zoom;

    let adjustedFactorOfX = gapOfX * (this.zoomFactor - 1);
    let adjustedFactorOfY = gapOfY * (this.zoomFactor - 1);

    if (delta < 0){
      //view center X,Y축 조정
      newCenter.x += ( ngMousePosition.x > ngCenter.x ) ? ( adjustedFactorOfX ) : ( -adjustedFactorOfX );
      newCenter.y += ( ngMousePosition.y > ngCenter.y ) ? ( adjustedFactorOfY ) : ( -adjustedFactorOfY );

      this.currentProject.view.center = newCenter;
      this.newZoom = oldZoom * this.zoomFactor;
    }
    else{//zoom out
      //view center X,Y축 조정
      newCenter.x -= ( ngMousePosition.x > ngCenter.x ) ? ( adjustedFactorOfX ) : ( -adjustedFactorOfX );
      newCenter.y -= ( ngMousePosition.y > ngCenter.y ) ? ( adjustedFactorOfY ) : ( -adjustedFactorOfY );

      this.currentProject.view.center = newCenter;

      this.newZoom = oldZoom / this.zoomFactor;
    }
    this.zoomEventEmitter.emit(new ZoomEvent(ZoomEventEnum.ZOOM_CHANGED));
    return this.newZoom;
  }
  public resetInfiniteCanvas(){
    // console.log("InfiniteCanvasService >> resetInfiniteCanvas >> 진입함");
    this.initFlag = false;
    this.currentProject.layers.forEach( (value, index) => {
      if(value.data.type === DataType.INFINITE_CANVAS){
        value.removeChildren();
        value.remove();
      }
    } );
    this.initWhiteboardVariable();
    this.currentProject.layers.forEach((value, index) => {
      if(value.data.type === DataType.DRAWING_CANVAS){
        value.activate();
      }
    });
    this.whiteboardLayer.sendToBack();
    this.minimapSyncService.syncMinimap();
  }
  private initializeDrawingLayer(){
    if(!this.isDrawingLayerExist){
      this.drawingLayer = new Layer();
      this.drawingLayer.data.type = DataType.DRAWING_CANVAS;
      this.drawingLayer.data.isMovable = false;
      this.isDrawingLayerExist = true;
      this.whiteboardLayer.sendToBack();
      this.drawingLayer.activate();
    }
  }





}
