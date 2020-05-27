import { Injectable } from '@angular/core';
import {ApiRequesterService} from '../SocialLogin/api-requester/api-requester.service';
import {Observable} from 'rxjs';
import {UserDTO} from '../../DTO/user-dto';
import {HttpHelper} from '../../Model/Helper/http-helper/http-helper';
import {ProjectDto} from '../../DTO/ProjectDto/project-dto';
import {AuthRequestService} from '../SocialLogin/auth-request/auth-request.service';
import {UiService} from '../../Model/Helper/ui-service/ui.service';
import {RestPacketDto} from '../../DTO/RestPacketDto/RestPacketDto';

@Injectable({
  providedIn: 'root'
})
export class ProjectRequesterService {

  constructor(
    private apiRequester: ApiRequesterService,
    private authRequestService: AuthRequestService,
    private uiService: UiService,
  ) {

  }

  createProject(projectTitle) :Observable<ProjectDto>{
    return new Observable<ProjectDto>((observer)=>{

      this.apiRequester.post( HttpHelper.api.project.create.uri, {projectTitle : projectTitle} )
        .subscribe((data)=>{
          //console.log("ProjectRequesterService >> createProject >> data : ",data);
          let newProjectDto:ProjectDto = new ProjectDto();
          newProjectDto._id = data._id;
          newProjectDto.projectTitle = data.projectTitle;
          newProjectDto.createdBy = data.createdBy;
          newProjectDto.participantList = data.participantList;
          newProjectDto.kanbanData = data.kanbanData;
          newProjectDto.startDate = data.startDate;
          newProjectDto.whiteboardSessionList = data.whiteboardSessionList;
          observer.next(newProjectDto);
        }, (error)=>{
          //console.log("ProjectRequesterService >> createProject >> error : ",error);
        });
    });
  }

  generateInviteCode(projectId, remainCount) :Observable<any>{
    return new Observable<any>((observer)=>{

      this.apiRequester.post( HttpHelper.api.project.generateInviteCode.uri,
        {projectId : projectId, remainCount : remainCount} )
        .subscribe((data)=>{
          observer.next(data);
        }, (error)=>{
          //console.log("ProjectRequesterService >> createProject >> error : ",error);
          this.authRequestService.signOutProcess();
        });
    });
  }
  submitInviteCode(inviteCode) :Observable<any>{
    return new Observable<any>((observer)=>{
      this.apiRequester.get( HttpHelper.api.project.submitInviteCode.uri,
        {inviteCode : inviteCode} )
        .subscribe((data)=>{
          observer.next(data);
        }, (error)=>{
          //console.log("ProjectRequesterService >> submitInviteCode >> error : ",error);
          this.authRequestService.signOutProcess();
        });
    });
  }
  requestExitProject(projectId) :Observable<any>{
    return new Observable<any>((observer)=>{
      this.uiService.spin$.next(true);
      this.apiRequester.delete( HttpHelper.api.project.exit.uri,
        {projectId : projectId} )
        .subscribe((data)=>{
          this.uiService.spin$.next(false);
          observer.next(data);
        }, (error)=>{
          this.uiService.spin$.next(false);
          //console.log("ProjectRequesterService >> submitInviteCode >> error : ",error);
          this.authRequestService.signOutProcess();
        });
    });
  }
  requestUpdateProject(projectDto:ProjectDto) :Observable<any>{
    return new Observable<any>((observer)=>{
      this.uiService.spin$.next(true);
      this.apiRequester.patch( HttpHelper.api.project.patch.uri, projectDto )
        .subscribe((data)=>{
          this.uiService.spin$.next(false);
          observer.next(data);
        }, (error)=>{
          this.uiService.spin$.next(false);
          //console.log("ProjectRequesterService >> submitInviteCode >> error : ",error);
          this.authRequestService.signOutProcess();
        });
    });
  }

  getParticipantList(projectId) :Observable<any>{
    return new Observable<any>((observer)=>{
      this.apiRequester.get( HttpHelper.api.project.getParticipantList.uri,
        {projectId : projectId} )
        .subscribe((data:RestPacketDto)=>{
          observer.next(data.data);
        }, (error)=>{
          //console.log("ProjectRequesterService >> submitInviteCode >> error : ",error);
          this.authRequestService.signOutProcess();
        });
    });
  }




}
