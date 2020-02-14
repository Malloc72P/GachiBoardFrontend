import {Component, Input, OnInit} from '@angular/core';
import {KanbanItemEditComponent} from '../../../Whiteboard/project-supporter-pannel/kanban/kanban-item-edit/kanban-item-edit.component';
import {MatDialog} from '@angular/material';
import {CreateProjectComponent} from './create-project/create-project.component';
import {ProjectDto} from '../../../../DTO/ProjectDto/project-dto';
import {ProjectRequesterService} from '../../../../Controller/Project/project-requester.service';
import {UserDTO} from '../../../../DTO/user-dto';
import {AuthRequestService} from '../../../../Controller/SocialLogin/auth-request/auth-request.service';
import {AuthEvent} from '../../../../Controller/SocialLogin/auth-request/AuthEvent/AuthEvent';
import {WebsocketManagerService} from '../../../../Controller/Controller-WebSocket/websocket-manager/websocket-manager.service';
import {RouterHelperService} from '../../../../Model/Helper/router-helper-service/router-helper.service';

@Component({
  selector: 'app-main-page-root',
  templateUrl: './main-page-root.component.html',
  styleUrls: ['./main-page-root.component.css', './../main-article-style.css', './../../gachi-font.css']
})
export class MainPageRootComponent implements OnInit {
  private projectList:Array<ProjectDto>;
  private userDto:UserDTO = new UserDTO();
  constructor(
    public dialog: MatDialog,
    private projectRequesterService:ProjectRequesterService,
    private authRequestService:AuthRequestService,
    private websocketManagerService:WebsocketManagerService,
    private routerHelperService:RouterHelperService,
  ) {
    let inviteCode = null;
    inviteCode = localStorage.getItem("inviteCode");
    if(inviteCode){
      this.projectRequesterService.submitInviteCode(inviteCode)
        .subscribe((data)=>{
          console.log("MainPageRootComponent >> projectRequesterService >> data : ",data);
          localStorage.removeItem("inviteCode");
          this.routerHelperService.goToMainPage();
      })
    }

    this.projectList = new Array<ProjectDto>();
    this.userDto = this.authRequestService.getUserInfo();
    this.authRequestService.authEventEmitter.subscribe((authEvent:AuthEvent)=>{
      let userDto = authEvent.userInfo;
      console.log("MainPageRootComponent >> authEventEmitter >> userDto : ",userDto);
      this.userDto = userDto;
      console.log("MainPageRootComponent >>  >> this.userDto.participatingProjects : ",this.userDto.participatingProjects);
      for(let i = 0 ; i < this.userDto.participatingProjects.length; i++){
        let project = this.userDto.participatingProjects[i];
        this.projectList.push(project);
      }
    });
  }

  ngOnInit(){
  }

  onProjectCreateButtonClick(){
    const dialogRef = this.dialog.open(CreateProjectComponent, {
      width: '480px',
      data: {}
    });

    dialogRef.afterClosed().subscribe((result) => {
      console.log("MainPageRootComponent >>  >> result : ",result);
      this.projectList.push(result.projectDto);
    });

  }

}
