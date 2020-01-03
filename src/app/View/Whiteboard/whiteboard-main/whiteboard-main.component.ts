import { Component, OnInit, HostListener } from '@angular/core';
import { AuthRequestService } from '../../../Controller/SocialLogin/auth-request/auth-request.service';
import { RouterHelperService } from '../../../Model/Helper/router-helper-service/router-helper.service';
import {UserDTO} from '../../../DTO/user-dto';
import {PointerModeManagerService} from '../../../Model/Whiteboard/Pointer/pointer-mode-manager-service/pointer-mode-manager.service';
import { InfiniteCanvasService } from '../../../Model/Whiteboard/InfiniteCanvas/infinite-canvas.service';


import {
  PointerMode
} from '../../../Model/Whiteboard/Pointer/pointer-mode-enum-service/pointer-mode-enum.service';

// @ts-ignore
import Project = paper.Project;
// @ts-ignore
import Point = paper.Point;
// @ts-ignore
import Size = paper.Size;

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

  private htmlCanvasObject:HTMLCanvasElement;

  constructor(
    private apiRequester: AuthRequestService,
    private routerHelper: RouterHelperService,
    private pointerModeManager: PointerModeManagerService,
    private infiniteCanvasService: InfiniteCanvasService
  ) {

  }

  requestProtectedApi(){
    this.apiRequester.protectedApi()
      .subscribe((data: UserDTO)=>{
        let userInfo:UserDTO = {
          email       :   data.email,
          idToken     :   data.idToken,
          userName    :   data.userName,
          authToken   :   this.apiRequester.getAccessToken(),
        };
        this.apiRequester.setUserInfo(userInfo);
        console.log("PaperMainComponent >> constructor >> getUserInfo : ",this.apiRequester.getUserInfo());
        // TODO : 세션처리
        // this.wsManager = new WhiteboardWebsocketManager(this.apiRequester, this.wsService, this.debugService, this.project1);
        // this.wsManager.tryInitializewsService();
      },(error) => {
        console.log(error);
        this.routerHelper.goToLoginPage();
      });
  }

  ngOnInit() {

    this.htmlCanvasObject = document.getElementById("cv1") as HTMLCanvasElement;

    this.paperProject = new Project('cv1');
    this.pointerModeManager.activateTool(PointerMode.MOVE);

    this.infiniteCanvasService.initializeInfiniteCanvas(this.paperProject);

    this.paperProject.view.onMouseMove = (event)=>{
      this.cursorX = event.point.x;
      this.cursorY = event.point.y;
    };
  }

  selectMoveTool(){
    this.pointerModeManager.activateTool(PointerMode.MOVE);
  }
  selectDrawTool(){
    this.pointerModeManager.activateTool(PointerMode.DRAW);
  }
  @HostListener('window:resize')
  onWindowResized(){
    console.log("WhiteboardMainComponent >> onWindowResized >> 진입함");
    let bottomRight = this.getBottomRightPosition(this.htmlCanvasObject);
    console.log("WhiteboardMainComponent >> onWindowResized >> bottomRight : ",bottomRight);
    this.paperProject.view.viewSize = new Size( bottomRight.x, bottomRight.y );
    this.infiniteCanvasService.resetInfiniteCanvas();
  }
  zoomControl(event){
    let ngCanvasCenter = this.getCenterPosition(this.htmlCanvasObject);

    this.paperProject.view.zoom
      = this.infiniteCanvasService.changeZoom( this.paperProject.view.zoom,
                                                ngCanvasCenter,
                                                new Point(event.x, event.y),
                                                event.deltaY );
  }
  ngCursorTracker(event){
    this.ngCursorX = event.x;
    this.ngCursorY = event.y;
  }
  getCenterPosition(el){
    let width = this.getWidthOfHtmlElement(el);
    let height = this.getHeightOfHtmlElement(el);
    return new Point( width/2, height/2 );
  }
  getBottomRightPosition(el){
    let width = this.getWidthOfHtmlElement(el);
    let height = this.getHeightOfHtmlElement(el);
    return new Point( width, height);
  }
  getWidthOfHtmlElement(el){
    return parseFloat(getComputedStyle(el, null).width.replace("px", ""));
  }
  getHeightOfHtmlElement(el){
    return parseFloat(getComputedStyle(el, null).height.replace("px", ""))
  }

}
