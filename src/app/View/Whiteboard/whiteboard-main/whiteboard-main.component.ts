import {Component, HostListener, OnDestroy, OnInit} from '@angular/core';
import {AuthRequestService} from '../../../Controller/SocialLogin/auth-request/auth-request.service';
import {RouterHelperService} from '../../../Model/Helper/router-helper-service/router-helper.service';
import {UserDTO} from '../../../DTO/user-dto';
import {InfiniteCanvasService} from '../../../Model/Whiteboard/InfiniteCanvas/infinite-canvas.service';
import {PointerModeManagerService} from '../../../Model/Whiteboard/Pointer/pointer-mode-manager-service/pointer-mode-manager.service';
import {PanelManagerService} from '../../../Model/Whiteboard/Panel/panel-manager-service/panel-manager.service';
import {PositionCalcService} from '../../../Model/Whiteboard/PositionCalc/position-calc.service';
import {ZoomControlService} from '../../../Model/Whiteboard/InfiniteCanvas/ZoomControl/zoom-control.service';

import {PointerMode} from '../../../Model/Whiteboard/Pointer/pointer-mode-enum-service/pointer-mode-enum.service';
import * as paper from 'paper';

import {DebugingService} from '../../../Model/Helper/DebugingHelper/debuging.service';
import {MinimapSyncService} from '../../../Model/Whiteboard/InfiniteCanvas/MinimapSync/minimap-sync.service';
import {ContextMenuService} from '../../../Model/Whiteboard/ContextMenu/context-menu-service/context-menu.service';
import {DrawingLayerManagerService} from '../../../Model/Whiteboard/InfiniteCanvas/DrawingLayerManager/drawing-layer-manager.service';
import {LinkModeManagerService} from '../../../Model/Whiteboard/InfiniteCanvas/DrawingLayerManager/LinkModeManagerService/link-mode-manager.service';
import {CursorTrackerService} from '../../../Model/Whiteboard/CursorTracker/cursor-tracker-service/cursor-tracker.service';
import {WhiteboardItemDto} from '../../../DTO/WhiteboardItemDto/whiteboard-item-dto';
import {WhiteboardItemFactory} from '../../../Model/Whiteboard/InfiniteCanvas/WhiteboardItemFactory/whiteboard-item-factory';
import {WorkHistoryManager} from '../../../Model/Whiteboard/InfiniteCanvas/DrawingLayerManager/WorkHistoryManager/work-history-manager';
import {ItemLifeCycleEnum} from '../../../Model/Whiteboard/Whiteboard-Item/WhiteboardItemLifeCycle/WhiteboardItemLifeCycle';
import {WhiteboardSessionDto} from '../../../DTO/ProjectDto/WhiteboardSessionDto/whiteboard-session-dto';
import {ActivatedRoute} from '@angular/router';
import {WsProjectController} from '../../../Controller/Controller-WebSocket/websocket-manager/ProjectWsController/ws-project.controller';
import {WsWhiteboardSessionController} from '../../../Controller/Controller-WebSocket/websocket-manager/WhiteboardSessionWsController/ws-whiteboard-session.controller';
import {WebsocketManagerService} from '../../../Controller/Controller-WebSocket/websocket-manager/websocket-manager.service';
import {UserManagerService} from '../../../Model/UserManager/user-manager.service';
import {ParticipantDto} from '../../../DTO/ProjectDto/ParticipantDto/participant-dto';
import {ProjectDto} from '../../../DTO/ProjectDto/project-dto';
import {GachiColorList} from '../../../DTO/WhiteboardItemDto/ColorDto/gachi-color-dto';
import {WbSessionEventManagerService} from '../../../Controller/Controller-WebSocket/websocket-manager/WhiteboardSessionWsController/wb-session-event-manager.service';
import {Subscription} from 'rxjs';
import {
  WbSessionEvent,
  WbSessionEventEnum
} from '../../../Controller/Controller-WebSocket/websocket-manager/WhiteboardSessionWsController/wb-session-event/wb-session-event';
import {GachiPointDto} from '../../../DTO/WhiteboardItemDto/PointDto/gachi-point-dto';
// @ts-ignore
import Project = paper.Project;
// @ts-ignore
import Point = paper.Point;
// @ts-ignore
import PaperScope = paper.PaperScope;
// @ts-ignore
import Color = paper.Color;
import {CursorData} from '../../../DTO/ProjectDto/WhiteboardSessionDto/Cursor-Data/Cursor-Data';
import {WsWhiteboardController} from '../../../Controller/Controller-WebSocket/websocket-manager/WhiteboardWsController/ws-whiteboard.controller';
import {WebsocketPacketDto} from '../../../DTO/WebsocketPacketDto/WebsocketPacketDto';
import {WbItemFactoryResult} from '../../../Model/Whiteboard/InfiniteCanvas/WhiteboardItemFactory/WbItemFactoryResult/wb-item-factory-result';
import {WbItemPacketDto} from '../../../DTO/WhiteboardItemDto/WbItemPacketDto/WbItemPacketDto';

@Component({
  selector: 'app-whiteboard-main',
  templateUrl: './whiteboard-main.component.html',
  styleUrls: ['./whiteboard-main.component.css']
})
export class WhiteboardMainComponent implements OnInit,OnDestroy {
  public whiteboardPaperProject: Project;
  public whiteboardPaperScope: PaperScope;

  public currentPointerMode;
  public htmlCanvasObject: HTMLCanvasElement;
  public htmlCanvasWrapperObject: HTMLDivElement;

  public connectedUserList:Array<string>;
  public wbTitle = "GachiBoard";


  ngCursorTracker(event) {
    this.debugingService.ngCursorX = event.x;
    this.debugingService.ngCursorY = event.y;
  }

  requestProtectedApi() {
  }

  constructor(
    public websocketManagerService: WebsocketManagerService,
    public authRequestService: AuthRequestService,
    public routerHelper: RouterHelperService,
    public pointerModeManager: PointerModeManagerService,
    public infiniteCanvasService: InfiniteCanvasService,
    public posCalcService: PositionCalcService,
    public panelManager: PanelManagerService,
    public zoomControlService: ZoomControlService,
    public debugingService: DebugingService,
    public minimapSyncService: MinimapSyncService,
    public contextMenuService: ContextMenuService,
    public layerService: DrawingLayerManagerService,
    public linkModeManagerService: LinkModeManagerService,
    public cursorTrackerService: CursorTrackerService,
    public route: ActivatedRoute,
    public userManagerService: UserManagerService,
    public wbSessionEventManagerService: WbSessionEventManagerService,
  ) {
    this.connectedUserList = new Array<string>();
  }

  private wbSessionDto:WhiteboardSessionDto = new WhiteboardSessionDto();
  ngOnInit() {
    this.initWhiteboardMainComponent();
    this.route.queryParamMap.subscribe((params) => {
      //#1. URI 패러미터 파싱 >>> WhiteboardSessionDto 획득
      console.log("WhiteboardMainComponent >> #1. URI 패러미터 파싱 >>> WhiteboardSessionDto 획득");
      let wbSessionId = params.get('wbSessionId');
      let projectId   = params.get('projectId');

      console.log("WhiteboardMainComponent >> ngOnInit >> wbSessionId : ",wbSessionId);
      console.log("WhiteboardMainComponent >> ngOnInit >> projectId : ",projectId);
      if(wbSessionId || projectId){
        //#### 오류발생 팝업 띄우고 프로젝트 페이지로 리다이렉션
      }
      console.log("WhiteboardMainComponent >> ngOnInit >> wbSessionId : ",wbSessionId);
      //#2. Protected 요청 수행
      console.log("WhiteboardMainComponent >> Protected 요청 수행");
      this.authRequestService.protectedApi().subscribe((userDto:UserDTO)=>{
        //#3. Project Join 수행
        console.log("WhiteboardMainComponent >> #3. Project Join 수행");
        let wsProjectController = WsProjectController.getInstance();
        wsProjectController.waitJoinProject(userDto.idToken,userDto.accessToken,projectId)
          .subscribe((projectDto:ProjectDto)=>{
            this.userManagerService.initService(projectDto);
            console.log("WhiteboardMainComponent >> #4. Whiteboard Join 수행");
            console.log("WhiteboardMainComponent >> #5. WhiteboardSessionDto의 정보를 이용해서 WhiteboardItemList까지 가지고 있는 FullData 요청");
            //#4. Whiteboard Join 수행
            //#5. WhiteboardSessionDto의 정보를 이용해서 WhiteboardItemList까지 가지고 있는 FullData 요청
            let wbSessionDto = new WhiteboardSessionDto();
            wbSessionDto._id = wbSessionId;
            let wsWbSessionController = WsWhiteboardSessionController.getInstance();
            wsWbSessionController.waitRequestJoinWbSession(wbSessionDto)
              .subscribe((wbSessionFullDto:WhiteboardSessionDto)=>{
                console.log("WhiteboardMainComponent >>  >> wbSessionFullDto : ",wbSessionFullDto);
                //#6. FullData획득시, 데이터에 있는 아이템을 전부 Layer서비스에 등록
                console.log("WhiteboardMainComponent >> #6. FullData획득시, 데이터에 있는 아이템을 전부 Layer서비스에 등록");

                wsWbSessionController.requestPingToWbSession().subscribe((data) => {
                  //console.log("WhiteboardMainComponent >> ngOnInit >> data : ", data);
                });
                this.minimapSyncService.syncMinimap();
                this.initCursorTrackerInstance(wbSessionFullDto, userDto);
                this.wbTitle = wbSessionFullDto.title;

                let recvWbItemPacketDtoList:Array<WbItemPacketDto> = wbSessionFullDto.wbItemArray as Array<WbItemPacketDto>;
                console.log("WhiteboardMainComponent >> waitRequestGetWbItemList >> recvWbItemPacketDtoList : ",recvWbItemPacketDtoList);
                for(let recvWbItemPacket of recvWbItemPacketDtoList){
                  WhiteboardItemFactory.buildWbItems(recvWbItemPacket.wbItemDto, this.layerService.whiteboardItemArray)
                    .subscribe((factoryRes:WbItemFactoryResult)=>{
                      factoryRes.newWbItem.group.opacity = 1;
                      factoryRes.newWbItem.coreItem.opacity = 1;
                      this.minimapSyncService.syncMinimap();
                    });
                }


                // let wsWbController = WsWhiteboardController.getInstance();
/*
                wsWbController.waitRequestGetWbItemList()
                  .subscribe((wsPacketDto:WebsocketPacketDto)=>{
                  });
*/
              });
          });

      });
    });
  }//ngOnInit()

  initCursorTrackerInstance(wbSessionFullDto, userDto){
    this.cursorTrackerService.on();
    this.connectedUserList = wbSessionFullDto.connectedUsers;
    for (let i = 0; i < wbSessionFullDto.connectedUsers.length; i++) {
      let currConnUserIdToken = wbSessionFullDto.connectedUsers[i];

      if(currConnUserIdToken === userDto.idToken){
        continue;
      }
      let currConnParticipantInfo:ParticipantDto = this.websocketManagerService.getUserInfoByIdToken(currConnUserIdToken);
      let targetIndex = this.websocketManagerService.getUserIndexByIdToken(currConnUserIdToken);

      let userColor = GachiColorList.getColor(targetIndex);
      console.log("WhiteboardMainComponent >>  >> userColor : ",userColor);

      this.cursorTrackerService.addUser(currConnParticipantInfo.idToken, new Point(0,0),new Color(userColor));
    }
    this.subscribeWbSessionEventEmitter();
    this.whiteboardPaperProject.view.onMouseMove = (event) => {
      if (this.cursorThrottle) {
        return;
      }
      this.debugingService.cursorX = this.cursorTrackerService.currentCursorPosition.x = event.point.x;
      this.debugingService.cursorY = this.cursorTrackerService.currentCursorPosition.y = event.point.y;

      this.sendCursorData();
      this.cursorThrottle = true;
      setTimeout(()=>{
        this.cursorThrottle = false;
      },30);
    };
    this.cursorTrackerService.refreshPoint();
  }
  private wbSessionSubscription:Subscription;
  subscribeWbSessionEventEmitter(){

    this.wbSessionSubscription = this.wbSessionEventManagerService.wsWbSessionEventEmitter.subscribe((wbSessionEvent:WbSessionEvent)=>{
      if(wbSessionEvent.action === WbSessionEventEnum.JOIN){
        console.log("WhiteboardMainComponent >> JOIN >> wbSessionEvent : ",wbSessionEvent);

        if (wbSessionEvent.additionalData) {
          //this.connectedUserList.push(wbSessionEvent.additionalData);
          this.pushToConnectedUserArray(wbSessionEvent.additionalData);
        }

      } else if(wbSessionEvent.action === WbSessionEventEnum.UPDATE_CURSOR){
        //console.log("WhiteboardMainComponent >> UPDATE_CURSOR >> wbSessionEvent : ",wbSessionEvent.additionalData);
        this.parsePositionData(wbSessionEvent.additionalData);
        this.cursorTrackerService.refreshPoint();
      }
    })
  }
  pushToConnectedUserArray(idToken){
    let i = this.connectedUserList.length;
    while (i--) {
      let currUserIdToken = this.connectedUserList[i];
      if (currUserIdToken === idToken) {
        this.connectedUserList.splice(i, 1);
      }
    }
    this.connectedUserList.push(idToken);
  }
  parsePositionData(cursorDataArray:Array<CursorData>){
    if(!cursorDataArray){ return; }

    for(let cursorData of cursorDataArray){
      //console.log("WhiteboardMainComponent >> parsePositionData >> cursorData : ",cursorData);
      if(cursorData.idToken === this.websocketManagerService.userInfo.idToken){
        continue;
      }
      this.cursorTrackerService.updateUser(cursorData.idToken, cursorData.position);
    }
  }

  ngOnDestroy(): void {
    this.wbSessionSubscription.unsubscribe();
  }

  initWhiteboardMainComponent(){
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
    this.whiteboardPaperProject.activeLayer.onFrame = (event) => {
    };
  }

  sendCursorData(){
    let newPosition = new GachiPointDto(
      this.cursorTrackerService.currentCursorPosition.x,
      this.cursorTrackerService.currentCursorPosition.y
    );
    let wsWbSessionColtroller = WsWhiteboardSessionController.getInstance();
    wsWbSessionColtroller.sendCursorData(newPosition);
  }

  private cursorThrottle = false;
  public initWhiteboardPaper() {
    paper.settings.hitTolerance = 40;

    this.htmlCanvasObject = document.getElementById("cv1") as HTMLCanvasElement;
    this.htmlCanvasWrapperObject = document.getElementById("canvasWrapper") as HTMLDivElement;
    this.whiteboardPaperScope = new PaperScope();
    this.whiteboardPaperScope.setup(this.htmlCanvasObject);
    this.whiteboardPaperScope.settings.hitTolerance = 40;

    this.whiteboardPaperProject = this.whiteboardPaperScope.project;
  }

  public initTextEditEvent() {
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
          break;
        case "KeyZ":
          workHistoryManager.undoTask();

          break;
      }
    }
    else if(event.ctrlKey && event.shiftKey){//Ctrl + Shift
      if (event.code === "KeyZ") {
        workHistoryManager.redoTask();
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
          this.layerService.globalSelectedGroup.destroyItem();
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

  get PointerMode() {
    return PointerMode;
  }
}
