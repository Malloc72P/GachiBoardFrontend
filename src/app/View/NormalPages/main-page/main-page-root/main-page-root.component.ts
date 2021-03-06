import {Component, EventEmitter, Input, OnDestroy, OnInit, Output} from '@angular/core';
import {CreateProjectComponent} from './create-project/create-project.component';
import {ProjectDto} from '../../../../DTO/ProjectDto/project-dto';
import {ProjectRequesterService} from '../../../../Controller/Project/project-requester.service';
import {UserDTO} from '../../../../DTO/user-dto';
import {AuthRequestService} from '../../../../Controller/SocialLogin/auth-request/auth-request.service';
import {AuthEvent} from '../../../../Controller/SocialLogin/auth-request/AuthEvent/AuthEvent';
import {WebsocketManagerService} from '../../../../Controller/Controller-WebSocket/websocket-manager/websocket-manager.service';
import {RouterHelperService} from '../../../../Model/Helper/router-helper-service/router-helper.service';
import {MatDialog} from '@angular/material/dialog';
import {AreYouSurePanelService} from '../../../../Model/PopupManager/AreYouSurePanelManager/are-you-sure-panel.service';
import {Subscription} from 'rxjs';

@Component({
  selector: 'app-main-page-root',
  templateUrl: './main-page-root.component.html',
  styleUrls: ['./main-page-root.component.css', './../main-article-style.css', './../../gachi-font.css']
})
export class MainPageRootComponent implements OnInit, OnDestroy {
  public projectList:Array<ProjectDto>;
  public userDto:UserDTO = new UserDTO();
  @Output() userDtoEventEmitter:EventEmitter<any> = new EventEmitter<any>();

  public subscriptionList:Array<Subscription> = new Array<Subscription>();

  constructor(
    public dialog: MatDialog,
    public projectRequesterService:ProjectRequesterService,
    public authRequestService:AuthRequestService,
    public routerHelperService:RouterHelperService,
    public areYouSurePanelService:AreYouSurePanelService
  ) {
    let inviteCode = null;
    inviteCode = localStorage.getItem("inviteCode");
    if(inviteCode){
      let subscription = this.projectRequesterService.submitInviteCode(inviteCode)
        .subscribe((data)=>{
          //console.log("MainPageRootComponent >> projectRequesterService >> data : ",data);
          localStorage.removeItem("inviteCode");
          // this.routerHelperService.goToMainPage();
          this.initPageData(data.result);
          subscription.unsubscribe();
      });
      this.subscriptionList.push(subscription);
    }

    this.projectList = new Array<ProjectDto>();
    this.userDto = this.authRequestService.getUserInfo();
    let subscription = this.authRequestService.authEventEmitter.subscribe((authEvent:AuthEvent)=>{
      let userDto = authEvent.userInfo;
      //console.log("MainPageRootComponent >> authEventEmitter >> userDto : ",userDto);
      this.initPageData(userDto);
      subscription.unsubscribe();
    });
    this.subscriptionList.push(subscription);

    let subscription2 = this.userDtoEventEmitter.subscribe((userDto:UserDTO)=>{
      this.initPageData(userDto);
    });
    this.subscriptionList.push(subscription2);
  }

  initPageData(userDto:UserDTO){
    //console.log("MainPageRootComponent >> initPageData >> userDto : ",userDto);
    this.userDto = userDto;
    this.projectList.splice(0, this.projectList.length);
    for(let i = 0 ; i < this.userDto.participatingProjects.length; i++){
      let project = this.userDto.participatingProjects[i];
      this.projectList.push(project);
    }
  }

  ngOnInit(){
  }
  ngOnDestroy(): void {
    for(let subscription of this.subscriptionList){
      subscription.unsubscribe();
    }
  }

  onProjectCreateButtonClick(){
    const dialogRef = this.dialog.open(CreateProjectComponent, {
      width: '480px',
      data: {}
    });

    dialogRef.afterClosed().subscribe((result) => {
      //console.log("MainPageRootComponent >>  >> result : ",result);
      this.projectList.push(result.projectDto);
    });

  }

}
