import {Injectable} from '@angular/core';
import {AuthRequestService} from '../../Controller/SocialLogin/auth-request/auth-request.service';
import {AuthEvent, AuthEventEnum} from '../../Controller/SocialLogin/auth-request/AuthEvent/AuthEvent';
import {ProjectDto} from '../../DTO/ProjectDto/project-dto';
import {ParticipantDto} from '../../DTO/ProjectDto/ParticipantDto/participant-dto';


@Injectable({
  providedIn: 'root'
})
export class UserManagerService {
  private userList:Array<ParticipantDto>;
  constructor(
    private authRequestService:AuthRequestService
  ) {
    this.userList = new Array<ParticipantDto>();

    /*this.addUser(new ParticipantDto("Unassigned"));
    this.addUser(new ParticipantDto("SAKURA"));
    this.addUser(new ParticipantDto("TOHSAKA"));
    this.addUser(new ParticipantDto("ARTORIA"));*/
  }
  public initService(projectDto:ProjectDto){
    this.userList.slice(0, this.userList.length);
    for (let participantDto of projectDto.participantList){
      console.log("UserManagerService >> initService >> participantDto : ",participantDto);
      this.userList.push(participantDto);
    }
  }
  getUnassignedUserName(){
    return "Unassigned";
  }
  getUserList(){
    return this.userList;
  }
  addUser(user:ParticipantDto){
    this.userList.push(user);
  }
  getUserDataByName(userName){
    for(let i = 0 ; i < this.userList.length; i++){
      let currentUser = this.userList[i];
      if(currentUser.userName === userName){
        return currentUser
      }
    }
    return null;

  }
  deleteUser(userName:string){
    let index = -1;
    for(let i = 0 ; i < this.userList.length; i++){
      let currentUser = this.userList[i];
      if(currentUser.userName === userName){
        index = i;
      }
    }
    if( index >= 0 ){
      this.userList.splice(index, 1);
    }
  }

  public static getParticipantByIdToken(idToken, projectDto:ProjectDto):ParticipantDto{
    for (let participant of projectDto.participantList){
      if(participant.idToken === idToken){
        return participant;
      }
    }
    return null;
  }
}
