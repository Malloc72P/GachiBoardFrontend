import { Injectable } from '@angular/core';
import {ApiRequesterService} from '../SocialLogin/api-requester/api-requester.service';
import {Observable} from 'rxjs';
import {UserDTO} from '../../DTO/user-dto';
import {HttpHelper} from '../../Model/Helper/http-helper/http-helper';
import {ProjectDto} from '../../DTO/ProjectDto/project-dto';
import {AuthRequestService} from '../SocialLogin/auth-request/auth-request.service';

@Injectable({
  providedIn: 'root'
})
export class ProjectRequesterService {

  constructor(
    private apiRequester: ApiRequesterService,
    private authRequestService: AuthRequestService,
  ) {

  }

  createProject(projectTitle) :Observable<ProjectDto>{
    return new Observable<ProjectDto>((observer)=>{

      this.apiRequester.post( HttpHelper.api.project.create.uri, {projectTitle : projectTitle} )
        .subscribe((data)=>{
          console.log("ProjectRequesterService >> createProject >> data : ",data);
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
          console.log("ProjectRequesterService >> createProject >> error : ",error);
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
          console.log("ProjectRequesterService >> createProject >> error : ",error);
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
          console.log("ProjectRequesterService >> submitInviteCode >> error : ",error);
          this.authRequestService.signOutProcess();
        });
    });
  }


  getProjects(){
    return new Observable<ProjectDto>((observer)=>{

      this.apiRequester.get( HttpHelper.api.project.getList.uri )
        .subscribe((data)=>{
          console.log("ProjectRequesterService >> getList >> data : ",data);

          /*let newProjectDto:ProjectDto = new ProjectDto();
          newProjectDto._id = data._id;
          newProjectDto.projectTitle = data.projectTitle;
          newProjectDto.createdBy = data.createdBy;
          newProjectDto.participantList = data.participantList;
          newProjectDto.kanbanData = data.kanbanData;
          newProjectDto.startDate = data.startDate;
          newProjectDto.whiteboardSessionList = data.whiteboardSessionList;*/

          observer.next(data);
        }, (error)=>{
          console.log("ProjectRequesterService >> createProject >> error : ",error);
          this.authRequestService.signOutProcess();
        });
    });
  }

}
