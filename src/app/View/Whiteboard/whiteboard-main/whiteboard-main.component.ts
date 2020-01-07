import {Component, HostListener, OnInit} from '@angular/core';
import { AuthRequestService } from '../../../Controller/SocialLogin/auth-request/auth-request.service';
import { RouterHelperService } from '../../../Model/Helper/router-helper-service/router-helper.service';
import {UserDTO} from '../../../DTO/user-dto';
import {InfiniteCanvasService} from '../../../Model/Whiteboard/InfiniteCanvas/infinite-canvas.service';
import {PointerModeManagerService} from '../../../Model/Whiteboard/Pointer/pointer-mode-manager-service/pointer-mode-manager.service';
import {PanelManagerService} from '../../../Model/Whiteboard/Panel/panel-manager-service/panel-manager.service';
import {PositionCalcService} from "../../../Model/Whiteboard/PositionCalc/position-calc.service";
import {ZoomControlService} from "../../../Model/Whiteboard/InfiniteCanvas/ZoomControl/zoom-control.service";
import {CanvasMoverService} from "../../../Model/Whiteboard/Pointer/CanvasMover/canvas-mover.service";

import { PointerMode } from '../../../Model/Whiteboard/Pointer/pointer-mode-enum-service/pointer-mode-enum.service';
import * as paper from 'paper';
// @ts-ignore
import Project = paper.Project;
// @ts-ignore
import Point = paper.Point;
// @ts-ignore
import Size = paper.Size;
// @ts-ignore
import Path = paper.Path;
import {DebugingService} from "../../../Model/Helper/DebugingHelper/debuging.service";
import {MinimapSyncService} from '../../../Model/Whiteboard/InfiniteCanvas/MinimapSync/minimap-sync.service';


@Component({
  selector: 'app-whiteboard-main',
  templateUrl: './whiteboard-main.component.html',
  styleUrls: ['./whiteboard-main.component.css']
})
export class WhiteboardMainComponent implements OnInit {
  private paperProject: Project;

  private isMouseDown = false;
  private currentPointerMode;
  private htmlCanvasObject: HTMLCanvasElement;
  private htmlCanvasWrapperObject: HTMLDivElement;

  cursorX = 0;
  cursorY = 0;
  ngTouchCursorX = 0;
  ngTouchCursorY = 0;

  ngCursorTracker(event) {
    this.debugingService.ngCursorX = event.x;
    this.debugingService.ngCursorY = event.y;
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

  constructor(
    private apiRequester            : AuthRequestService,
    private routerHelper            : RouterHelperService,
    private pointerModeManager      : PointerModeManagerService,
    private infiniteCanvasService   : InfiniteCanvasService,
    private posCalcService          : PositionCalcService,
    private panelManager            : PanelManagerService,
    private zoomControlService      : ZoomControlService,
    private debugingService         : DebugingService,
    private minimapSyncService      : MinimapSyncService
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
    this.zoomControlService.initializeZoomControlService(this.paperProject);
    this.pointerModeManager.initializePointerModeManagerService(this.paperProject);
    this.debugingService.initializeDebugingService(this.paperProject);
    this.minimapSyncService.initializePositionCalcService(this.paperProject);


    this.paperProject.view.onMouseMove = (event) => {
      this.debugingService.cursorX = event.point.x;
      this.debugingService.cursorY = event.point.y;
    };
    setTimeout(()=>{
      this.minimapSyncService.syncMinimap();
    },100);
  }
  @HostListener('document:keydown', ['$event'])
  keydownHandler(event) {
    switch (this.pointerModeManager.currentPointerMode) {
      case PointerMode.MOVE:
        break;
      case PointerMode.DRAW:
        break;
      case PointerMode.ERASER:
        break;
      case PointerMode.LASSO_SELECTOR:
        if(event.code === "Delete") {
          this.pointerModeManager.lassoSelector.removeSelectedItem();
        }
        break;
      default:
        break;
    }
  }
}
