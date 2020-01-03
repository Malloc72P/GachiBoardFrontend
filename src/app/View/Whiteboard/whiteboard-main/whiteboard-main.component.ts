import { Component, OnInit } from '@angular/core';
import {AuthRequestService} from '../../../Controller/SocialLogin/auth-request/auth-request.service';
import {RouterHelperService} from '../../../Model/Helper/router-helper-service/router-helper.service';

@Component({
  selector: 'app-whiteboard-main',
  templateUrl: './whiteboard-main.component.html',
  styleUrls: ['./whiteboard-main.component.css']
})
export class WhiteboardMainComponent implements OnInit {

  // constructor(
  //   private apiRequester: AuthRequestService,
  //   private routerHelper: RouterHelperService
  // ) { }

  // requestProtectedApi(){
  //   this.apiRequester.protectedApi()
  //     .subscribe((data: UserInfo)=>{
  //       let userInfo:UserInfo = {
  //         email       :   data.email,
  //         idToken     :   data.idToken,
  //         userName    :   data.userName,
  //         authToken   :   this.apiRequester.getAccessToken(),
  //       };
  //       this.apiRequester.setUserInfo(userInfo);
  //       console.log("PaperMainComponent >> constructor >> getUserInfo : ",this.apiRequester.getUserInfo());
  //       this.wsManager = new WhiteboardWebsocketManager(this.apiRequester, this.wsService, this.debugService, this.project1);
  //       this.wsManager.tryInitializewsService();
  //     },(error) => {
  //       console.log(error);
  //       this.routerHelper.goToSigningPage();
  //     });
  // }

  ngOnInit() {
  }

}
