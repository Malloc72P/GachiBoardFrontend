import {EventEmitter, Injectable, Output} from '@angular/core';
import {HttpHelper} from '../../../Model/Helper/http-helper/http-helper';
import {RouterHelperService} from '../../../Model/Helper/router-helper-service/router-helper.service';
import {UserDTO} from '../../../DTO/user-dto';


import {ApiRequesterService} from '../api-requester/api-requester.service';
import {Observable} from 'rxjs';
import {AuthEvent, AuthEventEnum} from './AuthEvent/AuthEvent';

@Injectable({
  providedIn: 'root'
})
export class AuthRequestService {
  @Output() authEventEmitter:EventEmitter<any> = new EventEmitter<any>();

  private userInfo:UserDTO;

  constructor(
    private routerHelper: RouterHelperService,
    private apiRequester: ApiRequesterService
  ) { }

  public checkLoggedInUser(){
    let accessToken = localStorage.getItem('accessToken');
    return !!accessToken;
  }

  public getAccessToken(){
    let accessToken = localStorage.getItem('accessToken');
    if(!accessToken){
      return null;
    } else{
      return accessToken;
    }
  }
  public setAuthToken(token){
    localStorage.setItem('accessToken', token);
  }
  public setUserInfo(userInfo: UserDTO){
    this.userInfo = userInfo;
  }
  public getUserInfo(){
    return this.userInfo;
  }

  //###### Custom Method
  signOut(){
    this.apiRequester.post(HttpHelper.api.signOut.uri,{})
      .subscribe(()=>{
        this.signOutProcess();
      },(error)=>{
        console.error(error);
        this.signOutProcess();
      });

  }

  private removeAccessToken(){
    localStorage.removeItem("accessToken");
  }

  public signOutProcess(){
    this.removeAccessToken();
    this.authEventEmitter.emit(
      new AuthEvent(AuthEventEnum.SIGN_OUT, this.userInfo)
    );

    // this.routerHelper.goToHomePage();
    this.routerHelper.redirectToHomePage();
  }

  //  현재 가지고 있는 토큰이 validate한지 검사함.
  //  보안상 의미있는 작업이 아님. 내 토큰이 쓸 수 있는지 확인하고,
  //  못쓰면 로그인창으로 보내줄 뿐임.
  protectedApi() :Observable<UserDTO>{
    return new Observable<UserDTO>((observer)=>{

      let accessToken = localStorage.getItem('accessToken');
      this.setAuthToken(accessToken);
      this.apiRequester.post( HttpHelper.api.protected.uri )
        .subscribe((data)=>{
          console.log("AuthRequestService >>  >> data : ",data);
          let userDto:UserDTO = new UserDTO(
            data.userDto._id,
            data.userDto.email,
            data.userDto.regDate,
            data.userDto.idToken,
            data.userDto.accessToken,
            data.userDto.userName,
            data.userDto.profileImg
          );
          userDto.participatingProjects = data.userDto.participatingProjects;

          console.log("AuthRequestService >>  >> userDto : ",userDto);
          this.setUserInfo(userDto);
          this.authEventEmitter.emit(new AuthEvent(AuthEventEnum.SIGN_IN, userDto));
          observer.next(userDto);
        }, (error)=>{
          console.warn("AuthRequestService >>  >> error : ", error);
          this.signOutProcess();
        });
    });
  }
}
