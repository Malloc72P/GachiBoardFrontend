import { Injectable } from '@angular/core';
import { HttpHelper } from '../../../Model/Helper/http-helper/http-helper';
import { RouterHelperService } from '../../../Model/Helper/router-helper-service/router-helper.service';
import { UserDTO } from '../../../DTO/user-dto';
import { HttpClient, HttpHeaders } from '@angular/common/http';
import { Observable } from 'rxjs';

@Injectable({
  providedIn: 'root'
})
export class AuthRequestService {
  private baseUrl: string = HttpHelper.apiUrl;
  public semUserInfo: boolean = false;

  private userInfo: UserDTO = {
    idToken     : '',
    email       : '',
    userName    : '',
    authToken   : ''
  };

  constructor(
    private http: HttpClient,
    private routerHelper: RouterHelperService
  ) { }

  public getAccessToken(){
    let accessToken = localStorage.getItem('accessToken');
    if(!accessToken){
      return null;
    } else{
      return accessToken;
    }
  }
  public setAccessToken(token){
    localStorage.setItem('accessToken', token);
  }
  public setUserInfo(userInfo: UserDTO){
    this.userInfo = userInfo;
  }
  public getUserInfo(){
    return this.userInfo;
  }

  // TODO : get, post 분리시켜서 재사용성 올릴 수 있음 (선택)
  //###### Pure Method
  public get(url, params = null): Observable<any> {
    return this.http.get(this.baseUrl + url, {
      params: params,
      headers: new HttpHeaders({
        'Content-Type': HttpHelper.getContentType()
      }),
      responseType: 'json'
    });
  }

  public post(url, params = null): Observable<any> {
    return this.http.post(this.baseUrl + url, params, {
      headers: new HttpHeaders({
        'Content-Type': HttpHelper.getContentType()
      }),
      responseType: 'json'
    });
  }

  //###### Custom Method
  signOut(){
    this.post(HttpHelper.api.signOut.uri,{})
      .subscribe(()=>{
        console.log("PaperMainComponent >> signOut >> 진입함");
        this.signOutProcess();
      },(error)=>{
        console.error(error);
        this.signOutProcess();
      });

  }
  signOutProcess(){
    this.setAccessToken("");
    this.routerHelper.goToLoginPage();
  }

  //  현재 가지고 있는 토큰이 validate한지 검사함.
  //  보안상 의미있는 작업이 아님. 내 토큰이 쓸 수 있는지 확인하고,
  //  못쓰면 로그인창으로 보내줄 뿐임.
  protectedApi(){
    return this.post( HttpHelper.api.protected.uri );
  }
}
