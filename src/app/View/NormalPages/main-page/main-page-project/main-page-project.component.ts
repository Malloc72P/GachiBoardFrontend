import {Component, OnDestroy, OnInit} from '@angular/core';
import {ActivatedRoute, Router} from '@angular/router';
import {KanbanGroup} from '../../../../Model/Whiteboard/ProjectSupporter/Kanban/KanbanGroup/kanban-group';
import {KanbanItem} from '../../../../Model/Whiteboard/ProjectSupporter/Kanban/KanbanItem/kanban-item';
import {KanbanItemColor} from '../../../../Model/Whiteboard/ProjectSupporter/Kanban/KanbanItemColorEnumManager/kanban-item-color.service';
import {KanbanTagListManagerService} from '../../../../Model/Whiteboard/ProjectSupporter/Kanban/KanbanTagListManager/kanban-tag-list-manager.service';
import {UserManagerService} from '../../../../Model/UserManager/user-manager.service';
import {KanbanComponent} from '../../kanban/kanban.component';
import {MatDialog} from '@angular/material';
import {PositionCalcService} from '../../../../Model/Whiteboard/PositionCalc/position-calc.service';
import {HtmlHelperService} from '../../../../Model/NormalPagesManager/HtmlHelperService/html-helper.service';
import {WebsocketManagerService} from '../../../../Controller/Controller-WebSocket/websocket-manager/websocket-manager.service';
import {AuthEvent} from '../../../../Controller/SocialLogin/auth-request/AuthEvent/AuthEvent';
import {UserDTO} from '../../../../DTO/user-dto';
import {AuthRequestService} from '../../../../Controller/SocialLogin/auth-request/auth-request.service';
import {WsProjectController} from '../../../../Controller/Controller-WebSocket/websocket-manager/ProjectWsController/ws-project.controller';
import {ProjectDto} from '../../../../DTO/ProjectDto/project-dto';
import {CreateProjectComponent} from '../main-page-root/create-project/create-project.component';
import {CreateInviteCodeComponent, CreateInviteCodeComponentData} from './create-invite-code/create-invite-code.component';

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
  private projectId = "";

  private userDto:UserDTO = new UserDTO();
  private projectDto:ProjectDto = new ProjectDto();

  todoGroup:KanbanGroup;
  inProgressGroup:KanbanGroup;
  doneGroup:KanbanGroup;

  kanbanGroups: Array<KanbanGroup>;
  constructor(
    private route: ActivatedRoute,
    private tagListMgrService:KanbanTagListManagerService,
    private userManagerService:UserManagerService,
    private htmlHelperService:HtmlHelperService,
    private authRequestService:AuthRequestService,
    public dialog: MatDialog,
    private websocketManagerService:WebsocketManagerService,
    private userManagerService1:UserManagerService,
  ) {
    this.projectId = this.route.snapshot.paramMap.get('projectId');
    this.kanbanGroups = new Array<KanbanGroup>();

    this.inProgressGroup = new KanbanGroup("In Progress", "accent");

    this.userDto = this.authRequestService.getUserInfo();
    this.authRequestService.authEventEmitter.subscribe((authEvent:AuthEvent)=>{
      let userDto = authEvent.userInfo;
      this.userDto = userDto;
      this.getProjectDto();
      this.userManagerService.initService(this.projectDto);

      this.joinProject(userDto);
    });
  }

  ngOnInit() {

  }
  ngOnDestroy(): void {
    console.log("\n\n================================================");
    console.log("MainPageProjectComponent >> ngOnDestroy >> 진입함");
    console.log("================================================\n\n");
    this.websocketManagerService.resetSocket();
  }

  private isRequestedJoin = false;
  joinProject(userDto){
    if (!this.isRequestedJoin) {
      let wsProjectController = WsProjectController.getInstance();
      wsProjectController.joinProject(userDto.idToken, userDto.accessToken, this.projectId);
      this.isRequestedJoin = true;
    }
  }

  getProjectDto(){
    this.userDto.participatingProjects.forEach((value:ProjectDto) => {
      if(value._id === this.projectId){
        this.projectDto = value;
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
      console.log('The dialog was closed');

    });
  }

  onSendBtnClick(){
    this.websocketManagerService.resetSocket();
    /*this.websocketManagerService.sendMessage(this.userDto.idToken);*/
  }
  onInviteBtnClick(projectDto){
    const dialogRef = this.dialog.open(CreateInviteCodeComponent, {
      width: '480px',
      data: new CreateInviteCodeComponentData(projectDto)
    });

    dialogRef.afterClosed().subscribe((result) => {

    });
  }


}
