import {AfterViewInit, Component, Input, OnInit, Renderer2, ViewChild} from '@angular/core';
import {HtmlHelperService} from '../../../../../Model/NormalPagesManager/HtmlHelperService/html-helper.service';
import {RouterHelperService} from '../../../../../Model/Helper/router-helper-service/router-helper.service';
import {ProjectDto} from '../../../../../DTO/ProjectDto/project-dto';
import {AreYouSurePanelService} from '../../../../../Model/PopupManager/AreYouSurePanelManager/are-you-sure-panel.service';
import {Subscription} from 'rxjs';
import {ProjectRequesterService} from '../../../../../Controller/Project/project-requester.service';
import {UserDTO} from '../../../../../DTO/user-dto';
import {ParticipantDto, ParticipantState} from '../../../../../DTO/ProjectDto/ParticipantDto/participant-dto';
import {CreateProjectComponent} from '../../../main-page/main-page-root/create-project/create-project.component';
import {MatDialog} from '@angular/material/dialog';
import {EditProjectComponent} from '../../../main-page/main-page-root/edit-project/edit-project.component';
import {AuthRequestService} from '../../../../../Controller/SocialLogin/auth-request/auth-request.service';
import {AuthorityLevel} from '../../../../../DTO/ProjectDto/ParticipantDto/authority-level.enum';
import {RestPacketDto} from '../../../../../DTO/RestPacketDto/RestPacketDto';

@Component({
  selector: 'app-project-card',
  templateUrl: './project-card.component.html',
  styleUrls: ['./project-card.component.css', './../../../gachi-font.css']
})
export class ProjectCardComponent implements OnInit, AfterViewInit {
  @ViewChild('projectCard') projectCard;
  @Input() projectDto:ProjectDto;
  @Input()marginValue = '0px';
  @Input()userDtoEventEmitter;

  public isHovering = false;

  public projectCardEl:HTMLElement;

  public m = [4][4];

  constructor(
    public dialog: MatDialog,
    public renderer: Renderer2,
    public htmlHelperService:HtmlHelperService,
    public routerHelperService:RouterHelperService,
    public areYouSurePanelService:AreYouSurePanelService,
    public projectRequesterService:ProjectRequesterService,
    public authRequestService:AuthRequestService,
  ) { }

  ngOnInit() {
    this.checkAuth();
  }
  ngAfterViewInit(): void {
    console.log("ProjectCardComponent >> ngAfterViewInit >> projectCard : ",this.projectCard);
    this.projectCardEl = this.projectCard.nativeElement
  }

  onMouseMove(event){

    let offset = this.htmlHelperService.offset(this.projectCardEl);
    let relX:number = event.pageX - offset.left;
    let relY:number = event.pageY - offset.top;
    let offsetMinX:number = this.htmlHelperService.width(this.projectCardEl);
    let offsetMinY:number = this.htmlHelperService.height(this.projectCardEl);
    let currentX = relX += offsetMinX * -0.5;
    let currentY = relY += offsetMinY * -0.5;
    let newX = currentX/700000;
    let newY = currentY/1500000;

    this.renderer.setStyle(this.projectCardEl, 'transform',
      "matrix3d(1.025,0,0,"+-newX+",0,1.025,0,"+-newY+",0,0,1,0,0,0,0,1)" );
  }
  onMouseLeave(event){
    this.renderer.setStyle(this.projectCardEl, 'transform',
      "matrix3d(1,0,0,0,0,1,0,0,0,0,1,0,0,0,0,1)" );
  }

  onProjectCardClick(){
    this.routerHelperService.goToProjectPage(this.projectDto._id);
  }

  public getCreaterName(participantList, createdBy){
    for(let i = 0 ; i < participantList.length; i++){
      let currParticipant = participantList[i];
      if(createdBy === currParticipant.idToken){
        return currParticipant.userName;
      }
    }
  }

  onProjectEdit(){
    const dialogRef = this.dialog.open(EditProjectComponent, {
      width: '480px',
      data: { projectDto: this.projectDto }
    });

    dialogRef.afterClosed().subscribe((response) => {
      console.log("ProjectCardComponent >>  >> response : ",response);
      if(response && response.res){
        let restPacketDto:RestPacketDto = response.res as RestPacketDto;
        this.userDtoEventEmitter.emit(restPacketDto.data);
      }
    });
  }

  private readonly deleteMsg1 = "정말로 프로젝트에서 나가시겠어요?";
  private readonly deleteMsg2 = "프로젝트에서 나가도, 다시 초대해주면 다시 참여할 수 있어요.";
  deleteSubscription:Subscription = null;
  onProjectExit(){
    this. deleteSubscription = this.areYouSurePanelService.openAreYouSurePanel(this.deleteMsg1, this.deleteMsg2).subscribe((res)=>{
      if(this.deleteSubscription){
        this.deleteSubscription.unsubscribe();
      }
      console.log("ProjectCardComponent >> onProjectDelete >> res : ",res);
      if(res){
        let subscription = this.projectRequesterService.requestExitProject(this.projectDto._id).subscribe((userDto:UserDTO)=>{
          subscription.unsubscribe();
          console.log("ProjectCardComponent >> onProjectDelete >> userDto : ",userDto);
          this.userDtoEventEmitter.emit(userDto);
        });
      }
    });
  }
  filterParticipantList() :Array<ParticipantDto>{
    let filteredArray:Array<ParticipantDto> = new Array<ParticipantDto>();
    for(let participantDto of this.projectDto.participantList){
      if (participantDto.state === ParticipantState.AVAIL) {
        filteredArray.push(participantDto);
      }
    }
    return filteredArray;
  }
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

}
