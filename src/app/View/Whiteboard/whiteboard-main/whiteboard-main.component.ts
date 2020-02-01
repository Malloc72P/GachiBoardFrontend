import {Component, EventEmitter, HostListener, OnInit} from '@angular/core';
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
// @ts-ignore
import PaperScope = paper.PaperScope;

import {DebugingService} from "../../../Model/Helper/DebugingHelper/debuging.service";
import {MinimapSyncService} from '../../../Model/Whiteboard/InfiniteCanvas/MinimapSync/minimap-sync.service';
import {WhiteboardContextMenuComponent} from "../whiteboard-context-menu/whiteboard-context-menu.component";
import {ContextMenuService} from "../../../Model/Whiteboard/ContextMenu/context-menu-service/context-menu.service";
import {DrawingLayerManagerService} from '../../../Model/Whiteboard/InfiniteCanvas/DrawingLayerManager/drawing-layer-manager.service';
import {LinkModeManagerService} from '../../../Model/Whiteboard/InfiniteCanvas/DrawingLayerManager/LinkModeManagerService/link-mode-manager.service';
import {CursorTrackerService} from "../../../Model/Whiteboard/CursorTracker/cursor-tracker-service/cursor-tracker.service";

@Component({
  selector: 'app-whiteboard-main',
  templateUrl: './whiteboard-main.component.html',
  styleUrls: ['./whiteboard-main.component.css']
})
export class WhiteboardMainComponent implements OnInit {
  private whiteboardPaperProject: Project;
  private whiteboardPaperScope: PaperScope;

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
    private minimapSyncService      : MinimapSyncService,
    private contextMenuService      : ContextMenuService,
    private layerService            : DrawingLayerManagerService,
    private linkModeManagerService  :LinkModeManagerService,
    private cursorTrackerService    : CursorTrackerService,
  ) {
  }

  ngOnInit() {
    this.currentPointerMode = PointerMode.MOVE;

    //Whiteboard Main Paper 생성
    this.initWhiteboardPaper();
    //this.pointerModeManager.activateTool(PointerMode.DRAW);

    //서비스 이니셜라이징
    this.infiniteCanvasService.initializeInfiniteCanvas(this.whiteboardPaperProject);
    this.posCalcService.initializePositionCalcService(this.whiteboardPaperProject);
    this.zoomControlService.initializeZoomControlService(this.whiteboardPaperProject);

    this.pointerModeManager.initializePointerModeManagerService(this.whiteboardPaperProject);

    this.debugingService.initializeDebugingService(this.whiteboardPaperProject);

    this.minimapSyncService.initializePositionCalcService(this.whiteboardPaperProject);
    this.layerService.initializeDrawingLayerService(this.whiteboardPaperProject, this.contextMenuService);
    this.linkModeManagerService.initLinkModeManagerService(this.layerService.linkModeEventEmitter);

    // TODO : Tracker Test Code
    // 미안 매번 끄는거 너무 귀찮아
    //this.cursorTrackerService.on();

    this.whiteboardPaperProject.view.onMouseMove = (event) => {
      this.debugingService.cursorX = event.point.x;
      this.debugingService.cursorY = event.point.y;

      // TODO : Tracker Test Code
      this.cursorTrackerService.updateUser("AAA", event.point);
    };

    this.whiteboardPaperProject.activeLayer.onFrame = (event)=>{
      if(event.count%10 === 0){
        this.minimapSyncService.syncMinimap();
        // TODO : Tracker Test Code
        this.cursorTrackerService.refreshPoint();
      }
      if(event.count%60 === 0) {
        this.cursorTrackerService.updateUser("BBB", new Point(Math.random() * 500, Math.random() * 500));
        this.cursorTrackerService.updateUser("CCC", new Point(Math.random() * 500, Math.random() * 500));
      }
    }
  }//ngOnInit()

  private initWhiteboardPaper(){
    paper.settings.hitTolerance = 40;

    this.htmlCanvasObject = document.getElementById("cv1") as HTMLCanvasElement;
    this.htmlCanvasWrapperObject = document.getElementById("canvasWrapper") as HTMLDivElement;
    this.whiteboardPaperScope = new PaperScope();
    this.whiteboardPaperScope.setup(this.htmlCanvasObject);
    this.whiteboardPaperScope.settings.hitTolerance = 40;

    this.whiteboardPaperProject = this.whiteboardPaperScope.project;
  }


  @HostListener('document:keydown', ['$event'])
  keydownHandler(event) {

    // textEditor 에선 스킵
    if(event.target === document.getElementById("textEditor")) {
      return;
    }
    // 전역
    switch (event.code) {
      case "KeyQ":
        if(this.layerService.currentPointerMode === PointerMode.POINTER){
          document.getElementById(PointerMode[PointerMode.MOVE]).click();
        }else{
          document.getElementById(PointerMode[PointerMode.POINTER]).click();
        }
        break;
      case "Digit1":
        document.getElementById(PointerMode[PointerMode.DRAW]).click();
        break;
      case "Digit2":
        document.getElementById(PointerMode[PointerMode.HIGHLIGHTER]).click();
        break;
      case "Digit3":
        document.getElementById(PointerMode[PointerMode.SHAPE]).click();
        break;
      case "KeyE":
        document.getElementById(PointerMode[PointerMode.ERASER]).click();
        break;
      case "KeyR":
        document.getElementById(PointerMode[PointerMode.LASSO_SELECTOR]).click();
        break;
      case "KeyZ":
        this.linkModeManagerService.setDefaultLineLinkerMode();
        break;
      case "KeyX":
        this.linkModeManagerService.setDefaultDashedLineLinkerMode();
        this.debugingService.logDrawingLayer();
        break;
      case "KeyC":
        this.linkModeManagerService.setDefaultArrowLinkerMode();
        this.debugingService.logDrawingLayer();
        break;
      case "KeyV":
        this.linkModeManagerService.setDefaultDasshedArrowLinkerMode();
        this.debugingService.logDrawingLayer();
        break;
      default:
        break;
    }

    // 모드 귀속
    switch (this.pointerModeManager.currentPointerMode) {
      case PointerMode.MOVE:
        break;
      case PointerMode.DRAW:
        break;
      case PointerMode.ERASER:
        break;
      case PointerMode.POINTER:
      case PointerMode.LASSO_SELECTOR:
        if(event.code === "Delete") {
          if(this.layerService.globalSelectedGroup.isLinkSelected){
            this.layerService.globalSelectedGroup.deleteSelectedLink();
          }else{
            this.layerService.globalSelectedGroup.destroyItem();
          }
          this.minimapSyncService.syncMinimap();
        }
        if(event.code === "KeyL"){
          this.layerService.globalSelectedGroup.wbItemGroup.forEach((value, index, array)=>{
            let WbItemDto = value.exportToDto();
            console.log("WhiteboardMainComponent >> exportToDto >> wbItemDto : ",WbItemDto);
          })
        }
        break;
      default:
        break;
    }
  }
}
