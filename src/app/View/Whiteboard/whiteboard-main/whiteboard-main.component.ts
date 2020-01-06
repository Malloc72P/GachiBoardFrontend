import {Component, OnInit} from '@angular/core';
import { AuthRequestService } from '../../../Controller/SocialLogin/auth-request/auth-request.service';
import { RouterHelperService } from '../../../Model/Helper/router-helper-service/router-helper.service';
import {UserDTO} from '../../../DTO/user-dto';
import {PointerModeManagerService} from '../../../Model/Whiteboard/Pointer/pointer-mode-manager-service/pointer-mode-manager.service';
import {PanelManagerService} from '../../../Model/Whiteboard/Panel/panel-manager-service/panel-manager.service';

import { PointerMode } from '../../../Model/Whiteboard/Pointer/pointer-mode-enum-service/pointer-mode-enum.service';
import * as paper from 'paper';
// @ts-ignore
import Project = paper.Project;


@Component({
  selector: 'app-whiteboard-main',
  templateUrl: './whiteboard-main.component.html',
  styleUrls: ['./whiteboard-main.component.css']
})
export class WhiteboardMainComponent implements OnInit {
  private paperProject: Project;

  // private pointerChangeEventEmitter: EventEmitter<any>;

  constructor(
    private apiRequester: AuthRequestService,
    private routerHelper: RouterHelperService,
    private pointerModeManager: PointerModeManagerService,
    private panelManager: PanelManagerService,
  ) {
    // this.pointerChangeEventEmitter = new EventEmitter<any>();
  }

  requestProtectedApi(){
    this.apiRequester.protectedApi()
      .subscribe((data: UserDTO)=>{
        let userInfo:UserDTO = {
          email       :   data.email,
          idToken     :   data.idToken,
          userName    :   data.userName,
          authToken   :   this.apiRequester.getAccessToken(),
        };
        this.apiRequester.setUserInfo(userInfo);
        console.log("PaperMainComponent >> constructor >> getUserInfo : ",this.apiRequester.getUserInfo());
        // TODO : 세션처리
        // this.wsManager = new WhiteboardWebsocketManager(this.apiRequester, this.wsService, this.debugService, this.project1);
        // this.wsManager.tryInitializewsService();
      },(error) => {
        console.log(error);
        this.routerHelper.goToLoginPage();
      });
  }

  ngOnInit() {
    this.paperProject = new Project('cv1');

    this.pointerModeManager.initListener();
  }
}
