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
  isZooming = 0;

  prevDistance = 0;
  currentDistance = 0;
  midPoint = new Point(0,0);
  pinchZoomSlower = 0;

  prevTouchPoint = new Point(0,0);

  readonly pinchZoomInSlowerLimit = 2;
  readonly pinchZoomOutSlowerLimit = -2;

  private htmlCanvasObject: HTMLCanvasElement;
  private htmlCanvasWrapperObject: HTMLDivElement;

  private isMouseDown = false;

  private currentPointerMode;

  constructor(
    private apiRequester: AuthRequestService,
    private routerHelper: RouterHelperService,
    private pointerModeManager: PointerModeManagerService,
    private infiniteCanvasService: InfiniteCanvasService
  ) {
  }

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

  ngOnInit() {

    this.currentPointerMode = PointerMode.MOVE;

    this.htmlCanvasObject = document.getElementById("cv1") as HTMLCanvasElement;
    this.htmlCanvasWrapperObject
      = document.getElementById("canvasWrapper") as HTMLDivElement;

    this.paperProject = new Project('cv1');
    //this.pointerModeManager.activateTool(PointerMode.DRAW);

    this.infiniteCanvasService.initializeInfiniteCanvas(this.paperProject);

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

    //==========추가 콜백함수 바인딩
    // window.addEventListener("orientationchange", () => {
    //   this.onWindowResized();
    // });
    //===========================
  }

  selectMoveTool() {
    this.currentPointerMode = PointerMode.MOVE;
  }

  selectDrawTool() {
    this.currentPointerMode = PointerMode.DRAW;
  }

  //HostListener 바인딩 ===========================================================================
  @HostListener('window:resize')
  onWindowResized() {
    // console.log("WhiteboardMainComponent >> onWindowResized >> 진입함");
    let bottomRight = this.getBottomRightPosition(this.htmlCanvasWrapperObject);
    // console.log("WhiteboardMainComponent >> onWindowResized >> bottomRight : ", bottomRight);
    this.paperProject.view.viewSize = new Size(bottomRight.x, bottomRight.y);
    this.infiniteCanvasService.resetInfiniteCanvas();
  }

  private newPath:Path;

  onMouseDown(event){
    event.preventDefault();
    this.isMouseDown = true;
    if(this.currentPointerMode === PointerMode.DRAW){

      // If we produced a path before, deselect it:
      if (this.newPath) {
        this.newPath.selected = false;
      }

      // Create a new path and set its stroke color to black:
      let paperLeftTop = this.paperProject.view.bounds.topLeft;
      let adjustedX = paperLeftTop.x + event.x;
      let adjustedY = paperLeftTop.y + event.y;
      let newPoint = new Point(adjustedX, adjustedY);

      this.newPath = new Path({
        segments: [newPoint],
        strokeColor: 'black',
        // Select the path, so we can see its segment points:
        //fullySelected: true
      });
    }

  }

  onMouseMove(event){
    event.preventDefault();
    if(this.isMouseDown){
      if(this.currentPointerMode === PointerMode.DRAW){
        let paperLeftTop = this.paperProject.view.bounds.topLeft;
        let adjustedX = paperLeftTop.x + event.x;
        let adjustedY = paperLeftTop.y + event.y;
        let newPoint = new Point(adjustedX, adjustedY);
        this.newPath.add( new Point( newPoint.x, newPoint.y ) );
      }
      else if(this.currentPointerMode === PointerMode.MOVE){
        let delta = new Point( -event.movementX, -event.movementY );
        this.infiniteCanvasService.movingAlg(delta);
        // @ts-ignore
        paper.view.scrollBy(delta);
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
      let delta = new Point( -event.movementX, -event.movementY );
      this.infiniteCanvasService.movingAlg(delta);
      // @ts-ignore
      paper.view.scrollBy(delta);
    }
  }


  onTouchStart(event) {
    event.preventDefault();
    console.log("WhiteboardMainComponent >> onTouchStart >> event : ",event);
    this.prevTouchPoint.x = event.touches[0].clientX;
    this.prevTouchPoint.y = event.touches[0].clientY;

    this.ngTouchCursorX = event.touches[0].clientX;
    this.ngTouchCursorY = event.touches[0].clientY;

    if(this.currentPointerMode === PointerMode.DRAW){
      // If we produced a path before, deselect it:
      if (this.newPath) {
        this.newPath.selected = false;
      }
      let paperLeftTop = this.paperProject.view.bounds.topLeft;
      let adjustedX = paperLeftTop.x + event.touches[0].clientX;
      let adjustedY = paperLeftTop.y + event.touches[0].clientY;
      let newPoint = new Point(adjustedX, adjustedY);
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

      let touchedPoint = new Point(event.touches[0].clientX, event.touches[0].clientY);
      if(this.isZooming > 0){
        return;
      }
      else if(this.currentPointerMode === PointerMode.DRAW){
        let paperLeftTop = this.paperProject.view.bounds.topLeft;
        let adjustedX = paperLeftTop.x + event.touches[0].clientX;
        let adjustedY = paperLeftTop.y + event.touches[0].clientY;
        let newPoint = new Point(adjustedX, adjustedY);
        this.newPath.add( newPoint );
      }
      else if(this.currentPointerMode === PointerMode.MOVE){
        let currentPoint = touchedPoint;

        let calcX = currentPoint.x - this.prevTouchPoint.x ;
        let calcY = currentPoint.y - this.prevTouchPoint.y ;

        let delta = new Point( -calcX, -calcY );
        console.log("WhiteboardMainComponent >> onTouchMove >> delta : ",delta);
        this.infiniteCanvasService.movingAlg(delta);
        // @ts-ignore
        paper.view.scrollBy(delta);
        this.prevTouchPoint.x = currentPoint.x;
        this.prevTouchPoint.y = currentPoint.y;
      }
    }
    if (event.touches.length == 2) {
      let p1 = new Point(event.touches[0].clientX, event.touches[0].clientY);
      let p2 = new Point(event.touches[1].clientX, event.touches[1].clientY);
      let currentDistance = this.calcPointDistanceOn2D(p1, p2);

      // console.log("WhiteboardMainComponent >> onTouchMove >> 핀치줌 식별함");
      if (this.isZooming == 2) {//핀치줌 시작후 추가식별됨
        let ngCanvasCenter = this.getCenterPosition(this.htmlCanvasObject);

        if(this.prevDistance <= currentDistance){//줌 인
          if( this.pinchZoomSlower < this.pinchZoomInSlowerLimit  ){
            if(this.pinchZoomSlower < 0){
              this.pinchZoomSlower = 0;
            }
            this.pinchZoomSlower++;
            return;
          }

          this.pinchZoomSlower = 0;
          this.paperProject.view.zoom = this.infiniteCanvasService.changeZoom(
            this.paperProject.view.zoom,
            ngCanvasCenter,
            this.midPoint,
            -100);
          this.prevDistance = currentDistance;
        }
        else{//줌 아웃
          if( this.pinchZoomSlower > this.pinchZoomOutSlowerLimit  ){
            if(this.pinchZoomSlower > 0){
              this.pinchZoomSlower = 0;
            }
            this.pinchZoomSlower--;
            return;
          }

          this.pinchZoomSlower = 0;
          this.paperProject.view.zoom = this.infiniteCanvasService.changeZoom(
            this.paperProject.view.zoom,
            ngCanvasCenter,
            this.midPoint,
            100);
          this.prevDistance = currentDistance;
        }
      } else {//핀치줌 시작하는 경우

        let midPoint = this.calcMidPointOn2D(p1, p2);

        this.isZooming = 2;

        this.midPoint = midPoint;
        this.currentDistance = currentDistance;
        this.prevDistance = currentDistance;

      }//핀치줌 시작하는 경우#####
    }
  }


  onTouchEnd(event) {
    event.preventDefault();
    // console.log("WhiteboardMainComponent >> onTouchEnd >> event : ", event);
    let endPoint = event.changedTouches[0];
    if(this.isZooming > 0){
      this.isZooming--;
    }
    else if(this.currentPointerMode === PointerMode.DRAW){
      this.newPath.simplify(2);
    }
    else if(this.currentPointerMode === PointerMode.MOVE && this.isZooming == 0){
      let currentPoint = new Point(endPoint.clientX, endPoint.clientY);

      let calcX = currentPoint.x - this.prevTouchPoint.x ;
      let calcY = currentPoint.y - this.prevTouchPoint.y ;

      let delta = new Point( -calcX, -calcY );
      console.log("WhiteboardMainComponent >> onTouchMove >> delta : ",delta);
      this.infiniteCanvasService.movingAlg(delta);
      // @ts-ignore
      paper.view.scrollBy(delta);
      this.prevTouchPoint.x = currentPoint.x;
      this.prevTouchPoint.y = currentPoint.y;
    }

  }


  onTouchCancel(event) {
    // console.log("WhiteboardMainComponent >> onTouchCancel >> event : ", event);
    this.ngTouchCursorX = event.touches[0].clientX;
    this.ngTouchCursorY = event.touches[0].clientY;
  }

  //HostListener 바인딩 ===========================================================================

  calcPointDistanceOn2D(p1: Point, p2: Point) {
    return Math.sqrt(Math.pow(p2.x - p1.x, 2) + Math.pow(p2.y - p1.y, 2));
  }
  calcMidPointOn2D(p1: Point, p2: Point) {
    return new Point( (p1.x + p2.x) / 2, (p1.y + p2.y) / 2 );
  }


  zoomControl(event) {
    // //console.log("WhiteboardMainComponent >> zoomControl >> event : ",event);
    event.preventDefault();

    if (event.ctrlKey) {//컨트롤 누르고 휠 돌리는 경우
      let ngCanvasCenter = this.getCenterPosition(this.htmlCanvasObject);

      this.paperProject.view.zoom = this.infiniteCanvasService.changeZoom(
        this.paperProject.view.zoom,
        ngCanvasCenter,
        new Point(event.x, event.y),
        event.deltaY);
    }
  }

  ngCursorTracker(event) {
    this.ngCursorX = event.x;
    this.ngCursorY = event.y;
  }

  getCenterPosition(el) {
    let width = this.getWidthOfHtmlElement(el);
    let height = this.getHeightOfHtmlElement(el);
    return new Point(width / 2, height / 2);
  }

  getBottomRightPosition(el) {
    let width = this.getWidthOfHtmlElement(el);
    let height = this.getHeightOfHtmlElement(el);
    return new Point(width, height);
  }

  getWidthOfHtmlElement(el) {
    return parseFloat(getComputedStyle(el, null).width.replace("px", ""));
  }

  getHeightOfHtmlElement(el) {
    return parseFloat(getComputedStyle(el, null).height.replace("px", ""))
  }

}
