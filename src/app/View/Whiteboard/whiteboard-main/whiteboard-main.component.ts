import {Component, OnInit, HostListener} from '@angular/core';
import {AuthRequestService} from '../../../Controller/SocialLogin/auth-request/auth-request.service';
import {RouterHelperService} from '../../../Model/Helper/router-helper-service/router-helper.service';
import {UserDTO} from '../../../DTO/user-dto';
import {PointerModeManagerService} from '../../../Model/Whiteboard/Pointer/pointer-mode-manager-service/pointer-mode-manager.service';
import {InfiniteCanvasService} from '../../../Model/Whiteboard/InfiniteCanvas/infinite-canvas.service';


import {
  PointerMode
} from '../../../Model/Whiteboard/Pointer/pointer-mode-enum-service/pointer-mode-enum.service';

// @ts-ignore
import Project = paper.Project;
// @ts-ignore
import Point = paper.Point;
// @ts-ignore
import Size = paper.Size;
// @ts-ignore
import Path = paper.Path;

import * as paper from 'paper';
import {PositionCalcService} from "../../../Model/Whiteboard/PositionCalc/position-calc.service";
import {ZoomControlService} from "../../../Model/Whiteboard/ZoomControl/zoom-control.service";
import {CanvasMoverService} from "../../../Model/Whiteboard/Pointer/CanvasMover/canvas-mover.service";


@Component({
  selector: 'app-whiteboard-main',
  templateUrl: './whiteboard-main.component.html',
  styleUrls: ['./whiteboard-main.component.css']
})
export class WhiteboardMainComponent implements OnInit {
  private paperProject: Project;
  cursorX = 0;
  cursorY = 0;
  ngCursorX = 0;
  ngCursorY = 0;
  ngTouchCursorX = 0;
  ngTouchCursorY = 0;

  prevTouchPoint = new Point(0,0);

  private isMouseDown = false;
  private currentPointerMode;


  private htmlCanvasObject: HTMLCanvasElement;
  private htmlCanvasWrapperObject: HTMLDivElement;



  requestProtectedApi() {
    this.apiRequester.protectedApi()
      .subscribe((data: UserDTO) => {
        let userInfo: UserDTO = {
          email: data.email,
          idToken: data.idToken,
          userName: data.userName,
          authToken: this.apiRequester.getAccessToken(),
        };
        this.apiRequester.setUserInfo(userInfo);
        // console.log("PaperMainComponent >> constructor >> getUserInfo : ", this.apiRequester.getUserInfo());
        // TODO : 세션처리
        // this.wsManager = new WhiteboardWebsocketManager(this.apiRequester, this.wsService, this.debugService, this.project1);
        // this.wsManager.tryInitializewsService();
      }, (error) => {
        // console.log(error);
        this.routerHelper.goToLoginPage();
      });
  }

  constructor(
    private apiRequester            : AuthRequestService,
    private routerHelper            : RouterHelperService,
    private pointerModeManager      : PointerModeManagerService,
    private infiniteCanvasService   : InfiniteCanvasService,
    private posCalcService          : PositionCalcService,
    private zoomCtrlService         : ZoomControlService,
    private canvasMoverService      : CanvasMoverService
  ) {
  }

  ngOnInit() {
    this.currentPointerMode = PointerMode.MOVE;

    this.htmlCanvasObject = document.getElementById("cv1") as HTMLCanvasElement;
    this.htmlCanvasWrapperObject
      = document.getElementById("canvasWrapper") as HTMLDivElement;

    this.paperProject = new Project('cv1');
    //this.pointerModeManager.activateTool(PointerMode.DRAW);

    //서비스 이니셜라이징
    this.infiniteCanvasService.initializeInfiniteCanvas(this.paperProject);
    this.posCalcService.initializePositionCalcService(this.paperProject);
    this.zoomCtrlService.initializeZoomControlService(this.paperProject);
    this.canvasMoverService.initializeCanvasMoverService(this.paperProject);


    this.paperProject.view.onMouseMove = (event) => {
      this.cursorX = event.point.x;
      this.cursorY = event.point.y;
    };

    this.htmlCanvasObject.addEventListener("mousedown",(event)=>{
      this.onMouseDown(event);
    });
    this.htmlCanvasObject.addEventListener("mousemove",(event)=>{
      this.onMouseMove(event);
    });
    this.htmlCanvasObject.addEventListener("mouseup",(event)=>{
      this.onMouseUp(event);
    });
    this.htmlCanvasObject.addEventListener("touchstart",(event)=>{
      this.onTouchStart(event);
    });
    this.htmlCanvasObject.addEventListener("touchmove",(event)=>{
      this.onTouchMove(event);
    });
    this.htmlCanvasObject.addEventListener("touchend",(event)=>{
      this.onTouchEnd(event);
    });
  }

  selectMoveTool() {
    this.currentPointerMode = PointerMode.MOVE;
  }

  selectDrawTool() {
    this.currentPointerMode = PointerMode.DRAW;
  }

  //HostListener 바인딩 ===========================================================================


  private newPath:Path;

  onMouseDown(event){
    event.preventDefault();
    this.isMouseDown = true;
    if(this.currentPointerMode === PointerMode.DRAW){

      // If we produced a path before, deselect it:
      if (this.newPath) {
        this.newPath.selected = false;
      }

      let paperLeftTop = this.paperProject.view.bounds.topLeft;
      let adjustedX = paperLeftTop.x + event.x / this.paperProject.view.zoom;
      let adjustedY = paperLeftTop.y + event.y / this.paperProject.view.zoom;
      let newPoint = new Point(adjustedX, adjustedY);

      this.newPath = new Path({
        segments: [newPoint],
        strokeColor: 'black',
      });
    }

  }
  onMouseMove(event){
    event.preventDefault();
    if(this.isMouseDown){
      if(this.currentPointerMode === PointerMode.DRAW){
        let paperLeftTop = this.paperProject.view.bounds.topLeft;
        let adjustedX = paperLeftTop.x + event.x / this.paperProject.view.zoom;
        let adjustedY = paperLeftTop.y + event.y / this.paperProject.view.zoom;
        let newPoint = new Point(adjustedX, adjustedY);
        this.newPath.add( new Point( newPoint.x, newPoint.y ) );
      }
      else if(this.currentPointerMode === PointerMode.MOVE){
        this.canvasMoverService.onPointerMove(event);
      }
    }
  }
  onMouseUp(event){
    event.preventDefault();
    this.isMouseDown = false;
    if(this.currentPointerMode === PointerMode.DRAW){
      this.newPath.simplify(2);
    }
    else if(this.currentPointerMode === PointerMode.MOVE){
      this.canvasMoverService.onPointerDown(event);
    }
  }


  onTouchStart(event) {
    event.preventDefault();
    console.log("WhiteboardMainComponent >> onTouchStart >> event : ",event);
    let currentPoint = this.posCalcService
                        .reflectZoomWithPoint( new Point(event.touches[0].clientX, event.touches[0].clientY) );
    this.prevTouchPoint = currentPoint;

    this.ngTouchCursorX = event.touches[0].clientX;
    this.ngTouchCursorY = event.touches[0].clientY;

    if(this.currentPointerMode === PointerMode.DRAW){
      // If we produced a path before, deselect it:
      if (this.newPath) {
        this.newPath.selected = false;
      }
      let newPoint = this.posCalcService.ngPointToCanvas(currentPoint);
      // Create a new path and set its stroke color to black:
      this.newPath = new Path({
        segments: [ newPoint ],
        strokeColor: 'black',
        // Select the path, so we can see its segment points:
        //fullySelected: true
      });
    }
  }
  onTouchMove(event) {
    event.preventDefault();
    console.log("WhiteboardMainComponent >> onTouchMove >> event : ", event);
    this.ngTouchCursorX = event.touches[0].clientX;
    this.ngTouchCursorY = event.touches[0].clientY;
    if(event.touches.length == 1){
      let currentPoint
        = this.posCalcService.reflectZoomWithPoint(new Point(event.touches[0].clientX, event.touches[0].clientY));

      if(this.zoomCtrlService.isZooming > 0){
        return;
      }
      else if(this.currentPointerMode === PointerMode.DRAW){
        let newPoint = this.posCalcService.ngPointToCanvas(currentPoint);
        this.newPath.add( newPoint );
      }
      else if(this.currentPointerMode === PointerMode.MOVE){
        let deltaX = currentPoint.x - this.prevTouchPoint.x ;
        let deltaY = currentPoint.y - this.prevTouchPoint.y ;

        let delta = new Point( -deltaX, -deltaY );
        this.infiniteCanvasService.movingAlg();
        // @ts-ignore
        paper.view.scrollBy(delta);
        this.prevTouchPoint.x = currentPoint.x;
        this.prevTouchPoint.y = currentPoint.y;
      }
    }
    if (event.touches.length == 2) {
      this.zoomCtrlService.onPinchZoomMove(event);
    }
  }
  onTouchEnd(event) {
    event.preventDefault();
    // console.log("WhiteboardMainComponent >> onTouchEnd >> event : ", event);
    let endPoint
      = this.posCalcService.reflectZoomWithPoint(
        new Point( event.changedTouches[0].clientX, event.changedTouches[0].clientY )
    );

    if(this.zoomCtrlService.isZooming > 0){
      this.zoomCtrlService.onPinchZoomEnd();
    }
    else if(this.currentPointerMode === PointerMode.DRAW){
      this.newPath.simplify(2);
    }
    else if(this.currentPointerMode === PointerMode.MOVE && this.zoomCtrlService.isZooming == 0){

      let calcX = endPoint.x - this.prevTouchPoint.x ;
      let calcY = endPoint.y - this.prevTouchPoint.y ;

      let delta = new Point( -calcX, -calcY );
      console.log("WhiteboardMainComponent >> onTouchMove >> delta : ",delta);
      this.infiniteCanvasService.movingAlg();
      // @ts-ignore
      paper.view.scrollBy(delta);
      this.prevTouchPoint.x = endPoint.x;
      this.prevTouchPoint.y = endPoint.y;
    }

  }

  ngCursorTracker(event) {
    this.ngCursorX = event.x;
    this.ngCursorY = event.y;
  }

}
