import {Component, OnDestroy, OnInit} from '@angular/core';
import {ActivatedRoute} from '@angular/router';
import {KanbanTagListManagerService} from '../../../../Model/Whiteboard/ProjectSupporter/Kanban/KanbanTagListManager/kanban-tag-list-manager.service';
import {UserManagerService} from '../../../../Model/UserManager/user-manager.service';
import {KanbanComponent} from '../../kanban/kanban.component';
import {HtmlHelperService} from '../../../../Model/NormalPagesManager/HtmlHelperService/html-helper.service';
import {WebsocketManagerService} from '../../../../Controller/Controller-WebSocket/websocket-manager/websocket-manager.service';
import {AuthEvent} from '../../../../Controller/SocialLogin/auth-request/AuthEvent/AuthEvent';
import {UserDTO} from '../../../../DTO/user-dto';
import {AuthRequestService} from '../../../../Controller/SocialLogin/auth-request/auth-request.service';
import {WsProjectController} from '../../../../Controller/Controller-WebSocket/websocket-manager/ProjectWsController/ws-project.controller';
import {ProjectDto} from '../../../../DTO/ProjectDto/project-dto';
import {CreateInviteCodeComponent, CreateInviteCodeComponentData} from './create-invite-code/create-invite-code.component';
import {KanbanItemDto} from '../../../../DTO/ProjectDto/KanbanDataDto/KanbanGroupDto/KanbanItemDto/kanban-item-dto';
import {KanbanDataDto} from '../../../../DTO/ProjectDto/KanbanDataDto/kanban-data-dto';
import {KanbanEvent, KanbanEventEnum} from '../../../../Model/Whiteboard/ProjectSupporter/Kanban/KanbanEvent/KanbanEvent';
import {KanbanEventManagerService} from '../../../../Model/Whiteboard/ProjectSupporter/Kanban/kanban-event-manager.service';
import {WsKanbanController} from '../../../../Controller/Controller-WebSocket/websocket-manager/KanbanWsController/ws-kanban.controller';
import {MatDialog} from '@angular/material/dialog';
import {CreateWbSessionComponent, CreateWbSessionComponentData} from './create-wb-session/create-wb-session.component';
import {WhiteboardSessionDto} from '../../../../DTO/ProjectDto/WhiteboardSessionDto/whiteboard-session-dto';
import {WbSessionEventManagerService} from '../../../../Controller/Controller-WebSocket/websocket-manager/WhiteboardSessionWsController/wb-session-event-manager.service';
import {Subscription} from 'rxjs';
import {
  WbSessionEvent,
  WbSessionEventEnum
} from '../../../../Controller/Controller-WebSocket/websocket-manager/WhiteboardSessionWsController/wb-session-event/wb-session-event';
import {WsWhiteboardSessionController} from '../../../../Controller/Controller-WebSocket/websocket-manager/WhiteboardSessionWsController/ws-whiteboard-session.controller';
import {RouterHelperService} from '../../../../Model/Helper/router-helper-service/router-helper.service';
import {UiService} from '../../../../Model/Helper/ui-service/ui.service';
import {AreYouSurePanelService} from '../../../../Model/PopupManager/AreYouSurePanelManager/are-you-sure-panel.service';
import {ProjectRequesterService} from '../../../../Controller/Project/project-requester.service';
import {EditProjectComponent} from '../main-page-root/edit-project/edit-project.component';
import {RestPacketDto} from '../../../../DTO/RestPacketDto/RestPacketDto';
import {AuthorityLevel} from '../../../../DTO/ProjectDto/ParticipantDto/authority-level.enum';
import {ParticipantDto, ParticipantState} from '../../../../DTO/ProjectDto/ParticipantDto/participant-dto';
import {EditWbSessionComponent, EditWbSessionComponentData} from './edit-wb-session/edit-wb-session.component';
import {
  WebsocketEvent,
  WebsocketEventEnum
} from '../../../../Controller/Controller-WebSocket/websocket-manager/WebsocketEvent/WebsocketEvent';

@Component({
  selector: 'app-main-page-project',
  templateUrl: './main-page-project.component.html',
  styleUrls: ['./main-page-project.component.css',
    './../main-article-style.css',
    './../../gachi-font.css',
    './../../../Whiteboard/project-supporter-pannel/project-supporter-pannel.component.css',
    '../../popup-pannel-commons.css']
})
export class MainPageProjectComponent implements OnInit, OnDestroy {
  public projectId = "";

  public userDto:UserDTO = new UserDTO();
  public projectDto:ProjectDto = new ProjectDto();

  inProgressGroup:Array<KanbanItemDto>;
  wbSessionList:Array<WhiteboardSessionDto>;
  public subscriptionList:Array<Subscription>;

  constructor(
    public route: ActivatedRoute,
    public tagListMgrService:KanbanTagListManagerService,
    public userManagerService:UserManagerService,
    public htmlHelperService:HtmlHelperService,
    public authRequestService:AuthRequestService,
    public dialog: MatDialog,
    public websocketManagerService:WebsocketManagerService,
    public userManagerService1:UserManagerService,
    public kanbanEventManager:KanbanEventManagerService,
    public wbSessionEventManagerService:WbSessionEventManagerService,
    public uiService:UiService,
    public areYouSurePanelService:AreYouSurePanelService,
    public projectRequesterService:ProjectRequesterService,
    public routerService:RouterHelperService
  ) {
    this.projectId = this.route.snapshot.paramMap.get('projectId');

    this.inProgressGroup = new Array<KanbanItemDto>();
    this.wbSessionList = new Array<WhiteboardSessionDto>();
    this.subscriptionList = new Array<Subscription>();

    this.userDto = this.authRequestService.getUserInfo();
    let subscription = this.authRequestService.authEventEmitter.subscribe((authEvent:AuthEvent)=>{
      let userDto = authEvent.userInfo;
      this.userDto = userDto;

      this.getProjectDto();



      this.userManagerService.initService(this.projectDto);

      // this.joinProject(userDto);
      let wsProjectController = WsProjectController.getInstance();
      let subscription = wsProjectController.waitJoinProject(userDto.idToken, userDto.accessToken, this.projectId)
        .subscribe((fullProjectDto:ProjectDto)=>{
        subscription.unsubscribe();

          let kanbanData:KanbanDataDto = fullProjectDto.kanbanData;
          let wbSessionListData:Array<WhiteboardSessionDto> = fullProjectDto.whiteboardSessionList;
          for(let kanbanItem of kanbanData.inProgressGroup){
            this.inProgressGroup.push(kanbanItem);
          }
          for(let wbSession of wbSessionListData){
            this.wbSessionList.push(wbSession);
          }

        },(errorDetail)=>{

          this.areYouSurePanelService.openAreYouSurePanel(
            "프로젝트를 이용할 수 없어요......", errorDetail,
            true
          ).subscribe(()=>{
            this.routerService.goToMainPage();
          })
        })
    });
    this.subscriptionList.push(subscription);

/*
    subscription = this.websocketManagerService.wsEventEmitter.subscribe((wsEvent:WebsocketEvent)=>{
      if(wsEvent.action === WebsocketEventEnum.GET_PROJECT_FULL_DATA){
        let fullProjectDto:ProjectDto = wsEvent.data as ProjectDto;
        let kanbanData:KanbanDataDto = fullProjectDto.kanbanData;
        let wbSessionListData:Array<WhiteboardSessionDto> = fullProjectDto.whiteboardSessionList;
        for(let kanbanItem of kanbanData.inProgressGroup){
          this.inProgressGroup.push(kanbanItem);
        }
        for(let wbSession of wbSessionListData){
          this.wbSessionList.push(wbSession);
        }
      }
    });
*/
    this.subscriptionList.push(subscription);
    this.subscribeKanbanEventEmitter();
    this.subscribeWbSessionEventEmitter();
    this.subscribeProjectEventEmitter();
  }

  subscribeKanbanEventEmitter(){
    let subscription = this.kanbanEventManager.kanbanEventEmitter.subscribe((kanbanEvent:KanbanEvent)=>{
      console.log("MainPageProjectComponent >> subscribeKanbanEventEmitter >> 진입함");
      console.log("MainPageProjectComponent >> subscribeKanbanEventEmitter >> kanbanEvent : ",kanbanEvent);
      switch (kanbanEvent.action) {
        case KanbanEventEnum.CREATE:
        case KanbanEventEnum.UPDATE:
        case KanbanEventEnum.DELETE:
        case KanbanEventEnum.RELOCATE:
        case KanbanEventEnum.CREATE_TAG:
        case KanbanEventEnum.DELETE_TAG:
          this.refreshInProgressGroup();
      }

    });
    this.subscriptionList.push(subscription);
  }
  subscribeWbSessionEventEmitter(){
    let subscription = this.wbSessionEventManagerService.wsWbSessionEventEmitter
      .subscribe((wbSessionEvent:WbSessionEvent)=>{
        console.log("MainPageProjectComponent >> subscribeWbSessionEventEmitter >> wbSessionEvent : ",wbSessionEvent);
      switch (wbSessionEvent.action) {
        case WbSessionEventEnum.CREATE:
        case WbSessionEventEnum.DELETE:
        case WbSessionEventEnum.UPDATE:
          this.refreshWbSessionList();
      }
    });
    this.subscriptionList.push(subscription);
  }
  subscribeProjectEventEmitter(){
    let subscription = this.websocketManagerService.wsEventEmitter
      .subscribe((websocketEvent:WebsocketEvent)=>{
        console.log("MainPageProjectComponent >> subscribeProjectEventEmitter >> websocketEvent : ",websocketEvent);
      switch (websocketEvent.action) {
        case WebsocketEventEnum.UPDATE:
          let projectDto:ProjectDto = websocketEvent.data;
          if(projectDto){
            this.projectDto.projectTitle = projectDto.projectTitle;
          }
          break;

      }
    });
    this.subscriptionList.push(subscription);
  }

  refreshInProgressGroup(){
    let wsKanbanController = WsKanbanController.getInstance();
    wsKanbanController.requestGetKanban().subscribe((kanbanData:KanbanDataDto)=>{
      this.inProgressGroup = kanbanData.inProgressGroup;
    });
  }
  refreshWbSessionList(){
    let wsKanbanController = WsWhiteboardSessionController.getInstance();
    console.log("MainPageProjectComponent >> refreshWbSessionList >> 진입함");
    wsKanbanController.requestGetWbSessionList()
      .subscribe((wbSessionList:Array<WhiteboardSessionDto>)=>{
        console.log("MainPageProjectComponent >> refreshWbSessionList >> wbSessionList : ",wbSessionList);
      this.wbSessionList = wbSessionList;
    });
  }



  ngOnInit() {

  }
  ngOnDestroy(): void {
    console.log("\n\n================================================");
    console.log("MainPageProjectComponent >> ngOnDestroy >> 진입함");
    console.log("================================================\n\n");
    for(let subscriptionItem of this.subscriptionList){
      subscriptionItem.unsubscribe();
    }
    this.websocketManagerService.resetSocket();
    this.uiService.spin$.next(false);
  }

  public isRequestedJoin = false;
  joinProject(userDto){
/*
    if (!this.isRequestedJoin) {
      let wsProjectController = WsProjectController.getInstance();
      wsProjectController.joinProject(userDto.idToken, userDto.accessToken, this.projectId);
      this.isRequestedJoin = true;
    }
*/
  }

  getProjectDto(){
    this.userDto.participatingProjects.forEach((value:ProjectDto) => {
      if(value._id === this.projectId){
        this.projectDto = value;
        this.checkAuth();
      }
    });
  }


  openKanbanPanel(kanbanObject){
    console.log("MainPageProjectComponent >> openKanbanPanel >> kanbanObject : ",kanbanObject);

    console.log("MainPageProjectComponent >> openKanbanPanel >> this.htmlHelperService.getWidthOfBrowser() : ",this.htmlHelperService.getWidthOfBrowser());

    const dialogRef = this.dialog.open(KanbanComponent, {
      width: this.htmlHelperService.getWidthOfBrowser()+"px",
      height: this.htmlHelperService.getHeightOfBrowser()+"px",
      maxWidth: this.htmlHelperService.getWidthOfBrowser()+"px",
      data: {
        projectDto:this.projectDto
      }
    });

    dialogRef.afterClosed().subscribe(result => {
      /*let wsKanbanController = WsKanbanController.getInstance();
      wsKanbanController.requestGetKanban();*/
      console.log("MainPageProjectComponent >>  >> result : ",result);
      this.refreshInProgressGroup();
    });
  }

  onSendBtnClick(){
    this.websocketManagerService.resetSocket();
    /*this.websocketManagerService.sendMessage(this.userDto.idToken);*/
  }
  onInviteBtnClick(){
    const dialogRef = this.dialog.open(CreateInviteCodeComponent, {
      width: '480px',
      data: new CreateInviteCodeComponentData(this.projectDto)
    });

    dialogRef.afterClosed().subscribe((result) => {

    });
  }
  onCreateWbSessionBtnClick(){
    const dialogRef = this.dialog.open(CreateWbSessionComponent, {
      width: '480px',
      data: new CreateWbSessionComponentData()
    });

    dialogRef.afterClosed().subscribe((result) => {
      if(result && result.createFlag){
        this.refreshWbSessionList();
      }
    });
  }


  //프로젝트 수정, 나가기 패널
  myAuthority = true;

  checkAuth(){
    let userDto:UserDTO = this.authRequestService.getUserInfo();
    if(userDto){
      for(let participantDto of this.projectDto.participantList){
        if(participantDto.idToken === userDto.idToken && participantDto.authorityLevel === AuthorityLevel.PROJECT_MANAGER){
          this.myAuthority = false;
          return;
        }
      }

    }
  }


  onProjectEdit(){
    const dialogRef = this.dialog.open(EditProjectComponent, {
      width: '480px',
      data: { projectDto: this.projectDto }
    });

    dialogRef.afterClosed().subscribe((response) => {
      console.log("ProjectCardComponent >> onProjectEdit >> response : ",response);
      if(response && response.res){
        let restPacketDto:RestPacketDto = response.res as RestPacketDto;
      }
    });
  }

  private readonly deleteMsg1 = "정말로 프로젝트에서 나가시겠어요?";
  private readonly deleteMsg2 = "프로젝트에서 나가도, 다시 초대해주면 다시 참여할 수 있어요.";
  deleteSubscription:Subscription = null;
  onProjectExit(){
    let firstMsg = this.deleteMsg1;
    let secondMsg = this.deleteMsg2;


    let subscription = this.projectRequesterService.getParticipantList(this.projectId).subscribe((participantList:Array<ParticipantDto>)=>{
      subscription.unsubscribe();
      console.log("MainPageProjectComponent >> onProjectExit >> participantList : ",participantList);

      let numberOfAvailUser = this.getNumberOfAvailUser(participantList);
      console.log("MainPageProjectComponent >> onProjectExit >> numberOfAvailUser : ",numberOfAvailUser);
      if(numberOfAvailUser <= 1){
        secondMsg = "회원님은 해당 프로젝트의 마지막 참여자이므로, 회원님이 탈퇴하시면 해당 프로젝트는 삭제됩니다!";
      }

      this. deleteSubscription = this.areYouSurePanelService.openAreYouSurePanel(firstMsg, secondMsg).subscribe((res)=>{
        if(this.deleteSubscription){
          this.deleteSubscription.unsubscribe();
        }
        console.log("ProjectCardComponent >> onProjectDelete >> res : ",res);
        if(res){
          let subscription = this.projectRequesterService.requestExitProject(this.projectDto._id).subscribe((userDto:UserDTO)=>{
            subscription.unsubscribe();
            console.log("ProjectCardComponent >> onProjectDelete >> userDto : ",userDto);
            this.routerService.goToMainPage();
          });
        }
      });

    });
  }

  getNumberOfAvailUser(participantList:Array<ParticipantDto>){
    let counter = 0;
    for(let participant of participantList){
      if (participant.state === ParticipantState.AVAIL) {
        counter++;
      }
    }
    return counter;
  }

}
