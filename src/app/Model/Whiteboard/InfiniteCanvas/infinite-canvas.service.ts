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

import * as paper from 'paper';

interface boundaryObserver {
  circle: Circle;
  textInfo: PointText;
  observerMutex: boolean
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
  public observerFamily: Map<string, boundaryObserver>;
  private whiteboardRect;
  private whiteboardLayer:Layer;
  private drawingLayer: Layer;

  zoomDepth = 0;
  zoomRatio = 0.0;

  private readonly zoomFactor = 1.05;
  private readonly zoomInMax = 40;
  private readonly zoomOutMax = -40;

  constructor() {}

  public initializeInfiniteCanvas( currentProject: Project ){
    if(this.initFlag){
      // console.log("InfiniteCanvasService >> initializeInfiniteCanvas >> 이미 초기화됨 : ");
      return;
    }

    this.whiteboardLayer = new Layer();
    this.whiteboardLayer.data.type = "infinite-canvas";
    this.whiteboardLayer.data.isMovable = false;
    this.currentProject = currentProject;
    this.observerFamily = new Map<string, boundaryObserver>();
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
    this.whiteboardBoundaryInitializer();
    this.initFlag = true;
    this.initializeDrawingLayer();
  }

  private whiteboardInitializer() {
    // console.log("InfiniteCanvasService >> whiteboardInitializer >> this.currentProject.view.bounds : ",this.currentProject.view.bounds);
    const gridStep: number = this.currentProject.view.bounds.width/10;
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
        // @ts-ignore
        //currentCell.cellData.fillColor = "#0002ff";
        currentCell.cellData.opacity = 0.3;
        //currentCell.cellData.fullySelected = true;

        /*currentCell.textInfo = new PointText({//디버깅용 textItem
          content: '[ ' + currentCell.id + ' ]',
          point: new Point(currentCell.cellData.bounds.center.x, currentCell.cellData.bounds.center.y),
          fillColor: 'black',
        });*/

        /*if (currentCell.id === 2) {
          currentCell.textInfo.content += 'TOP_CELL';
        } else if (currentCell.id === 4) {
          currentCell.textInfo.content += 'LEFT_CELL';
        } else if (currentCell.id === 6) {
          currentCell.textInfo.content += 'RIGHT_CELL';
        } else if (currentCell.id === 8) {
          currentCell.textInfo.content += 'BOTTOM_CELL';
        } else {

        }*/
        currentCell.cellGroup = new Group();
        currentCell.cellGroup.name = "mainframeMatrix";
        currentCell.cellGroup.addChild(currentCell.cellData);

        let topY = currentCell.cellData.bounds.topCenter.y;
        let bottomY = currentCell.cellData.bounds.bottomCenter.y;
        let leftX = currentCell.cellData.bounds.topLeft.x;
        let rightX = currentCell.cellData.bounds.topRight.x;


        for (let i = currentCell.cellData.bounds.topLeft.x; i <= currentCell.cellData.bounds.topRight.x; i += gridStep) {
          let gridMaker = new Path({
            strokeColor: 'blue',
            opacity: 0.2
          });
          gridMaker.moveTo(new Point(i, topY));
          gridMaker.lineTo(new Point(i, bottomY));
          currentCell.cellGroup.addChild(gridMaker);
        }
        for (let i = currentCell.cellData.bounds.topLeft.y; i <= currentCell.cellData.bounds.bottomLeft.y; i += gridStep) {
          let gridMaker = new Path({
            strokeColor: 'blue',
            opacity: 0.2
          });
          gridMaker.moveTo(new Point(leftX, i));
          gridMaker.lineTo(new Point(rightX, i));
          currentCell.cellGroup.addChild(gridMaker);
        }

      }//for
    }
  }//WhiteboardInitializer
  private whiteboardBoundaryInitializer() {
    let pos = this.currentProject.view.center;
    let tempView = this.currentProject.view;
    let tempArr = [];
    for (let i = 0; i < 5; i++) {
      // let newObserverCircle = new Path.Circle(new Point(0, 0), 10);
      // @ts-ignore
      // newObserverCircle.fillColor = 'black';
      // let newObserverTextInfo = new PointText({//디버깅용 textItem
      //   content: 'x : [ ' + pos.x + ' ] y : [ ' + pos.y + ' ]',
      //   point: new Point(pos.x, pos.y + 10),
      //   fillColor: 'black',
      // });
      // let newObserver: boundaryObserver = {
      //   circle: newObserverCircle,
      //   textInfo: newObserverTextInfo,
      //   observerMutex: true
      // };
      // tempArr.splice(tempArr.length, 0, newObserver);
    }
    // //console.log('PaperMainComponent > whiteboardInitializer > tempArr : ', tempArr);
    this.observerFamily.set('center',   tempArr[0]);
    this.observerFamily.set('left',     tempArr[1]);
    this.observerFamily.set('right',    tempArr[2]);
    this.observerFamily.set('top',      tempArr[3]);
    this.observerFamily.set('bottom',   tempArr[4]);
    // //console.log('PaperMainComponent > whiteboardInitializer > observerFamily : ', this.observerFamily);
    this.observerFamily.forEach((iterItem: boundaryObserver, key) => {
      switch (key) {
        case 'center' :
          // //console.log('PaperMainComponent > center > 진입함');
          pos = tempView.center;
          break;
        case 'left' :
          // //console.log('PaperMainComponent > left > 진입함');
          pos = tempView.bounds.leftCenter;
          break;
        case 'right' :
          // //console.log('PaperMainComponent > right > 진입함');
          pos = tempView.bounds.rightCenter;
          break;
        case 'top' :
          // //console.log('PaperMainComponent > top > 진입함');
          pos = tempView.bounds.topCenter;
          break;
        case 'bottom' :
          // //console.log('PaperMainComponent > bottom > 진입함');
          pos = tempView.bounds.bottomCenter;
          break;
      }
      // iterItem.circle.position = pos;
      // iterItem.textInfo.position.x = pos.x;
      // iterItem.textInfo.position.y = pos.y + 10;
      // iterItem.textInfo.content = 'x : [ ' + pos.x + ' ] y : [ ' + pos.y + ' ]';
    });
    // //console.log('PaperMainComponent > whiteboardInitializer > observerFamily : ', this.observerFamily);

    this.whiteboardRect = new Path.Rectangle(this.currentProject.view.bounds.scale(3));
    this.whiteboardRect.fillColor = '#0002ff';
    this.whiteboardRect.opacity = 0;
    this.whiteboardRect.position = pos;
  }

  public movingAlg(delta){
    let tempView = this.currentProject.view;


    let topVector = this.whiteboardMatrix[0][1];
    let bottomVector = this.whiteboardMatrix[2][1];
    let leftVector = this.whiteboardMatrix[1][0];
    let rightVector = this.whiteboardMatrix[1][2];

    let widthMargin = tempView.bounds.width/10;
    let heightMargin = tempView.bounds.height/10;

    let mutexObserverMover = true;

    this.observerFamily.forEach((iterItem :boundaryObserver, key)=>{
      let pos;
      switch (key) {
        case "center" :
          pos = tempView.center;
          /*iterItem.textInfo.position.x = pos.x;
          iterItem.textInfo.position.y = pos.y + iterItem.textInfo.bounds.height;*/
          break;
        case "left" :
          pos = tempView.bounds.leftCenter;
          /*iterItem.textInfo.position.x = pos.x + iterItem.textInfo.bounds.width;
          iterItem.textInfo.position.y = pos.y;*/
          if(pos.x - widthMargin <= leftVector.cellData.bounds.leftCenter.x){
            if (mutexObserverMover) {
              mutexObserverMover = false;
              // //console.log("영역 벗어남( left )");
              this.shiftRight();
            }
          }
          break;
        case "right" :
          pos = tempView.bounds.rightCenter;
          /*iterItem.textInfo.position.x = pos.x - iterItem.textInfo.bounds.width;
          iterItem.textInfo.position.y = pos.y;*/
          if(pos.x + widthMargin >= rightVector.cellData.bounds.rightCenter.x){
            if (mutexObserverMover) {
              mutexObserverMover = false;
              // //console.log("영역 벗어남( right )");
              this.shiftLeft();
            }
          }
          break;
        case "top" :
          pos = tempView.bounds.topCenter;
          /*iterItem.textInfo.position.x = pos.x;
          iterItem.textInfo.position.y = pos.y + iterItem.textInfo.bounds.height;*/
          if(pos.y - heightMargin < topVector.cellData.bounds.topCenter.y){
            if(mutexObserverMover){
              mutexObserverMover = false;
              // //console.log("PaperMainComponent > async_TopChecker > top 영역 벗어남");
              this.shiftDown();
            }
          }
          break;
        case "bottom" :
          pos = tempView.bounds.bottomCenter;
          /*iterItem.textInfo.position.x = pos.x;
          iterItem.textInfo.position.y = pos.y - iterItem.textInfo.bounds.height;*/
          if(pos.y + heightMargin > bottomVector.cellData.bounds.bottomCenter.y){
            if (mutexObserverMover) {
              mutexObserverMover = false;
              // //console.log('PaperMainComponent > async_BottomChecker > bottom 영역 벗어남');
              this.shiftUp();
            }
          }
          break;
      }
      /*iterItem.circle.position = pos;
      iterItem.textInfo.content = 'x : [ '+pos.x + " ] y : [ "+pos.y+" ]";*/
    });
  }

  private shiftDown() {
    this.whiteboardMatrix[2].forEach((vector: whiteboardCell) => {
      vector.cellGroup.position.y -= vector.cellGroup.bounds.height * 3;
      // vector.textInfo.position.y -= vector.cellGroup.bounds.height * 3;
    });
    this.whiteboardMatrix.unshift(this.whiteboardMatrix.pop());
  }

  private shiftUp() {
    this.whiteboardMatrix[0].forEach((vector: whiteboardCell) => {
      vector.cellGroup.position.y += vector.cellGroup.bounds.height * 3;
      // vector.textInfo.position.y += vector.cellGroup.bounds.height * 3;
    });
    this.whiteboardMatrix.push(this.whiteboardMatrix.shift());
  }

  private shiftRight() {
    this.whiteboardMatrix.forEach((vector) => {
      let tgtVector = vector[2] as whiteboardCell;
      tgtVector.cellGroup.position.x -= tgtVector.cellGroup.bounds.width * 3;
      // tgtVector.textInfo.position.x -= tgtVector.cellGroup.bounds.width * 3;
    });
    this.whiteboardMatrix.forEach(function(v) {
      v.unshift(v.pop());
    });
  }

  private shiftLeft() {
    this.whiteboardMatrix.forEach((vector) => {
      let tgtVector = vector[0] as whiteboardCell;
      tgtVector.cellGroup.position.x += tgtVector.cellGroup.bounds.width * 3;
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

    let gapOfX = Math.abs(ngMousePosition.x - ngCenter.x);
    let gapOfY = Math.abs(ngMousePosition.y - ngCenter.y);

    let adjustedFactorOfX = gapOfX * 0.05;
    let adjustedFactorOfY = gapOfY * 0.05;

    // console.log("InfiniteCanvasService >> changeZoom >> adjustedFactorOfX : ",adjustedFactorOfX);
    // console.log("InfiniteCanvasService >> changeZoom >> adjustedFactorOfY : ",adjustedFactorOfY);
    if (delta < 0){
      //view center X,Y축 조정
      newCenter.x += ( ngMousePosition.x > ngCenter.x ) ? ( adjustedFactorOfX ) : ( -adjustedFactorOfX );
      newCenter.y += ( ngMousePosition.y > ngCenter.y ) ? ( adjustedFactorOfY ) : ( -adjustedFactorOfY );

      this.currentProject.view.center = newCenter;
      return oldZoom * this.zoomFactor;
    }
    else{//zoom out
      //view center X,Y축 조정
      newCenter.x -= ( ngMousePosition.x > ngCenter.x ) ? ( adjustedFactorOfX ) : ( -adjustedFactorOfX );
      newCenter.y -= ( ngMousePosition.y > ngCenter.y ) ? ( adjustedFactorOfY ) : ( -adjustedFactorOfY );

      this.currentProject.view.center = newCenter;
      return oldZoom / this.zoomFactor;
    }
  }
  public resetInfiniteCanvas(){
    // console.log("InfiniteCanvasService >> resetInfiniteCanvas >> 진입함");
    this.initFlag = false;
    this.currentProject.layers.forEach( (value, index) => {
      if(value.data.type === "infinite-canvas"){
        // //console.log("InfiniteCanvasService >>  >> value : ",value);
        value.removeChildren();
      }
    } );
    this.initializeInfiniteCanvas(this.currentProject);
  }
  private initializeDrawingLayer(){
    this.drawingLayer = new Layer();
    this.drawingLayer.data.type = "drawing-canvas";
    this.drawingLayer.data.isMovable = false;
    this.drawingLayer.activate();
  }


}
