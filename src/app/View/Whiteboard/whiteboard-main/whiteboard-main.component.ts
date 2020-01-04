import {Component, EventEmitter, OnInit} from '@angular/core';
import { AuthRequestService } from '../../../Controller/SocialLogin/auth-request/auth-request.service';
import { RouterHelperService } from '../../../Model/Helper/router-helper-service/router-helper.service';
import {UserDTO} from '../../../DTO/user-dto';
import {PointerModeManagerService} from '../../../Model/Whiteboard/Pointer/pointer-mode-manager-service/pointer-mode-manager.service';

import {
  PointerMode
} from '../../../Model/Whiteboard/Pointer/pointer-mode-enum-service/pointer-mode-enum.service';

// @ts-ignore
import Project = paper.Project;

import * as paper from 'paper';

@Component({
  selector: 'app-whiteboard-main',
  templateUrl: './whiteboard-main.component.html',
  styleUrls: ['./whiteboard-main.component.css']
})
export class WhiteboardMainComponent implements OnInit {
  private paperProject: Project;
  private pointerMode: String;
  // private pointerChangeEventEmitter: EventEmitter<any>;

  constructor(
    private apiRequester: AuthRequestService,
    private routerHelper: RouterHelperService,
    private pointerModeManager: PointerModeManagerService,
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
    this.pointerModeManager.activateTool(PointerMode.DRAW); // default
  }

  onPointerModeChanged(panelParam){ //포인터모드 변경패널
    this.pointerMode = panelParam.mode;
    console.log("PaperMainComponent > onPointerModeChanged > pointerMode : ", this.pointerMode);

    switch (Number(this.pointerMode)) {
      case PointerMode.MOVE :
        this.pointerModeManager.activateTool(panelParam.mode);
        // this.pointerChangeEventEmitter.emit({mode: Number(panelParam.mode)});
        break;
      case PointerMode.DRAW :
        console.log("PaperMainComponent > onPointerModeChanged > DRAW 진입함");
        this.pointerModeManager.activateTool(panelParam.mode);
        // this.pointerChangeEventEmitter.emit({mode: Number(panelParam.mode)});
        break;
      case PointerMode.LASSO_SELECTOR :
        console.log("PaperMainComponent > onPointerModeChanged > LASSO_SELECTOR 진입함");
        this.pointerModeManager.activateTool(panelParam.mode);
        // this.pointerChangeEventEmitter.emit({mode: Number(panelParam.mode)});
        break;
      case PointerMode.ERASER :
        console.log('PaperMainComponent >> onPointerModeChanged >> ERASER 진입함');
        this.pointerModeManager.activateTool(panelParam.mode);
        // this.pointerChangeEventEmitter.emit({mode: Number(panelParam.mode)});
      default:
        console.log("PaperMainComponent > onPointerModeChanged-default > textItem : ", PointerMode[panelParam.mode]);
    }
  }
}
