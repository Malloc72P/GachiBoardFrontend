import {Component, HostListener, OnInit} from '@angular/core';
import { AuthRequestService } from '../../../Controller/SocialLogin/auth-request/auth-request.service';
import { RouterHelperService } from '../../../Model/Helper/router-helper-service/router-helper.service';
import {UserDTO} from '../../../DTO/user-dto';
import {InfiniteCanvasService} from '../../../Model/Whiteboard/InfiniteCanvas/infinite-canvas.service';
import {PointerModeManagerService} from '../../../Model/Whiteboard/Pointer/pointer-mode-manager-service/pointer-mode-manager.service';
import {PanelManagerService} from '../../../Model/Whiteboard/Panel/panel-manager-service/panel-manager.service';
import {PositionCalcService} from "../../../Model/Whiteboard/PositionCalc/position-calc.service";
import {ZoomControlService} from "../../../Model/Whiteboard/InfiniteCanvas/ZoomControl/zoom-control.service";

import { PointerMode } from '../../../Model/Whiteboard/Pointer/pointer-mode-enum-service/pointer-mode-enum.service';
import * as paper from 'paper';
// @ts-ignore
import Project = paper.Project;
// @ts-ignore
import Point = paper.Point;
// @ts-ignore
import PaperScope = paper.PaperScope;

import {DebugingService} from "../../../Model/Helper/DebugingHelper/debuging.service";
import {MinimapSyncService} from '../../../Model/Whiteboard/InfiniteCanvas/MinimapSync/minimap-sync.service';
import {ContextMenuService} from "../../../Model/Whiteboard/ContextMenu/context-menu-service/context-menu.service";
import {DrawingLayerManagerService} from '../../../Model/Whiteboard/InfiniteCanvas/DrawingLayerManager/drawing-layer-manager.service';
import {LinkModeManagerService} from '../../../Model/Whiteboard/InfiniteCanvas/DrawingLayerManager/LinkModeManagerService/link-mode-manager.service';
import {CursorTrackerService} from "../../../Model/Whiteboard/CursorTracker/cursor-tracker-service/cursor-tracker.service";
import {WhiteboardItemDto} from '../../../Model/Whiteboard/WhiteboardItemDto/whiteboard-item-dto';
import {WhiteboardItemFactory} from '../../../Model/Whiteboard/InfiniteCanvas/WhiteboardItemFactory/whiteboard-item-factory';
import {WorkHistoryManager} from '../../../Model/Whiteboard/InfiniteCanvas/DrawingLayerManager/WorkHistoryManager/work-history-manager';
import {ItemLifeCycleEnum} from '../../../Model/Whiteboard/Whiteboard-Item/WhiteboardItemLifeCycle/WhiteboardItemLifeCycle';

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
    private apiRequester: AuthRequestService,
    private routerHelper: RouterHelperService,
    private pointerModeManager: PointerModeManagerService,
    private infiniteCanvasService: InfiniteCanvasService,
    private posCalcService: PositionCalcService,
    private panelManager: PanelManagerService,
    private zoomControlService: ZoomControlService,
    private debugingService: DebugingService,
    private minimapSyncService: MinimapSyncService,
    private contextMenuService: ContextMenuService,
    private layerService: DrawingLayerManagerService,
    private linkModeManagerService: LinkModeManagerService,
    private cursorTrackerService: CursorTrackerService,
  ) {
  }

  ngOnInit() {
    this.currentPointerMode = PointerMode.MOVE;

    //Whiteboard Main Paper 생성
    this.initWhiteboardPaper();
    this.initTextEditEvent();
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
    WhiteboardItemFactory.initWhiteboardItemFactory(this.layerService);
    this.cursorTrackerService.initializeCursorTrackerService(this.infiniteCanvasService.zoomEventEmitter);

    this.whiteboardPaperProject.view.onMouseMove = (event) => {
      this.debugingService.cursorX = this.cursorTrackerService.currentCursorPosition.x = event.point.x;
      this.debugingService.cursorY = this.cursorTrackerService.currentCursorPosition.y = event.point.y;
    };

    this.whiteboardPaperProject.activeLayer.onFrame = (event) => {
      if (event.count % 10 === 0) {
        // TODO : Tracker Test Code
        this.cursorTrackerService.refreshPoint();
      }

      // let testCircle = new paper.Path.Circle(this.cursorTrackerService.itsMe, 10);
      // testCircle.fillColor = new paper.Color('black');
      // this.layerService.drawingLayer.addChild(testCircle);
    };
  }//ngOnInit()

  private initWhiteboardPaper() {
    paper.settings.hitTolerance = 40;

    this.htmlCanvasObject = document.getElementById("cv1") as HTMLCanvasElement;
    this.htmlCanvasWrapperObject = document.getElementById("canvasWrapper") as HTMLDivElement;
    this.whiteboardPaperScope = new PaperScope();
    this.whiteboardPaperScope.setup(this.htmlCanvasObject);
    this.whiteboardPaperScope.settings.hitTolerance = 40;

    this.whiteboardPaperProject = this.whiteboardPaperScope.project;
  }

  private initTextEditEvent() {
    let target = document.getElementById('textEditor');
    let hMenu = document.getElementById('horizonContextMenu');

    target.addEventListener('blur', () => {
      this.layerService.endEditText();
    });

    document.addEventListener('mousedown', (event) => {
      if(!(event.target === target || event.target === hMenu)) {
        target.blur();
      }
    });
  }

  @HostListener('document:keydown', ['$event'])
  keydownHandler(event) {
    // textEditor 에선 스킵
    if (event.target === document.getElementById("textEditor")) {
      return;
    }
    // 포인터로 무언가 그리거나 이동하는 등의 Mouse 이벤트가 시작된 상태면 단축키로 모드변경 못하도록 막음
    if (this.pointerModeManager.mouseDown) {
      return;
    }

    event.preventDefault();
    // 전역
    switch (event.code) {
      case "KeyQ":
        if (this.layerService.currentPointerMode === PointerMode.POINTER) {
          document.getElementById(PointerMode[PointerMode.MOVE]).click();
        } else {
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
      case "KeyU":
        this.linkModeManagerService.setDefaultLineLinkerMode();
        break;
      case "KeyI":
        this.linkModeManagerService.setDefaultArrowLinkerMode();
        break;
      case "KeyO":
        this.linkModeManagerService.setDefaultDashedLineLinkerMode();
        break;
      case "KeyP":
        this.linkModeManagerService.setDefaultDasshedArrowLinkerMode();
        break;
      case "Slash":
        this.debugingService.logDrawingLayer();
        break;
      default:
        break;
    }

    let gsg = this.layerService.globalSelectedGroup;
    let workHistoryManager = WorkHistoryManager.getInstance();

    if (event.ctrlKey && !event.shiftKey) {//컨트롤 필요한 단축키 처리
      switch (event.code) {
        case "KeyC":
          gsg.doCopy();
          break;
        case "KeyV":
          gsg.doPaste(this.cursorTrackerService.itsMe);
          break;
        case "KeyG":
          this.layerService.groupSelectedItems();
          //TODO 좌표 얻는 출처를 상현이의 커밋쪽을 기준으로 수정해야 함.
          break;
        case "KeyZ":
          let workData = workHistoryManager.undoTask();
          if(workData){
            console.log("\n\n");
            console.log("WhiteboardMainComponent >> keydownHandler >> currentOperation : ",ItemLifeCycleEnum[workData.action]);
            console.log("WhiteboardMainComponent >> keydownHandler >> workData : ",workData.wbItemDto);
            console.log("\n\n");
          }else {
            console.log("WhiteboardMainComponent >> keydownHandler >> undo 할 태스크 없음");
          }
          break;
      }
    }
    else if(event.ctrlKey && event.shiftKey){//Ctrl + Shift
      if (event.code === "KeyZ") {
        let workData = workHistoryManager.redoTask();
        if (workData) {
          console.log('\n\n');
          console.log('WhiteboardMainComponent >> keydownHandler >> currentOperation : ', ItemLifeCycleEnum[workData.action]);
          console.log('WhiteboardMainComponent >> keydownHandler >> workData : ', workData.wbItemDto);
          console.log("\n\n");
        }else {
          console.log("WhiteboardMainComponent >> keydownHandler >> redo 할 태스크 없음");
        }
      }

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
        if (event.code === "Delete") {
          if (this.layerService.globalSelectedGroup.isLinkSelected) {
            this.layerService.globalSelectedGroup.deleteSelectedLink();
          } else {
            this.layerService.globalSelectedGroup.destroyItem();
          }
          this.minimapSyncService.syncMinimap();
        }
        if (event.code === "KeyL") {
          this.layerService.globalSelectedGroup.wbItemGroup.forEach((value, index, array) => {
            let wbItemDto: WhiteboardItemDto = value.exportToDto();
            console.log("WhiteboardMainComponent >> exportToDto >> wbItemDto : ", wbItemDto);
            if (value.isGrouped) {
              let groupDto = value.parentEdtGroup.exportToDto();
              console.log("WhiteboardMainComponent >> exportToDto >> groupDto : ", groupDto);
            }
          });
        }
        break;
      default:
        break;
    }
  }
}
