import {ChangeDetectorRef, Component, OnDestroy, OnInit, ViewChild} from '@angular/core';
import {AuthRequestService} from '../../../Controller/SocialLogin/auth-request/auth-request.service';
import {RouterHelperService} from '../../../Model/Helper/router-helper-service/router-helper.service';
import {MediaMatcher} from '@angular/cdk/layout';
import {GachiSidebarManagerService} from '../../../Model/NormalPagesManager/gachi-sidebar-manager/gachi-sidebar-manager.service';
import {
  GachiSidebarEvent,
  GachiSidebarEventEnum
} from '../../../Model/NormalPagesManager/gachi-sidebar-manager/GachiSidebarEvent/GachiSidebarEvent';
import {UserDTO} from '../../../DTO/user-dto';
import {MatSidenav} from '@angular/material/sidenav';
import {transition, trigger, useAnimation} from '@angular/animations';
import {fadeInLeft, jackInTheBox} from 'ng-animate';
import {TextChatService} from "../../../Model/Whiteboard/TextChat/text-chat.service";
import {TextChatCoreComponent} from "../../Whiteboard/text-chat/text-chat-core/text-chat-core.component";
import {Router} from "@angular/router";

@Component({
  selector: 'app-main-page',
  templateUrl: './main-page.component.html',
  styleUrls: ['./main-page.component.css', './../gachi-font.css'],
  animations: [trigger('fadeIn',
    [transition('* => *', useAnimation(fadeInLeft,
      {params : {timing : 0.4, delay : 0}}))])]
})
export class MainPageComponent implements OnInit {
  fadeIn:any;
  @ViewChild('mainLeftDrawer', {static: true}) mainLeftDrawer;
  @ViewChild('drawer', {static: true}) rightSidebar:MatSidenav;
  public userName = "";
  public userDto = new UserDTO();
  constructor(
    public authRequestService:AuthRequestService,
    public routerHelperService:RouterHelperService,
    public sidebarManagerService:GachiSidebarManagerService,
    public textChat: TextChatService,
    private router: Router,
  ) {

  }

  ngOnInit() {
    this.authRequestService.protectedApi()
      .subscribe((userDto:UserDTO)=>{
      this.userName = userDto.userName;
      this.userDto = userDto;
    });

    this.sidebarManagerService.sidebarEventEmitter
      .subscribe((event:GachiSidebarEvent)=>{
        //console.log("GachiLeftSidebarComponent >> subscribe >> event : ",event);
        if (event.action === GachiSidebarEventEnum.TOGGLE_LEFT_SIDEBAR) {
          this.mainLeftDrawer.toggle();
        }
        else if (event.action === GachiSidebarEventEnum.TOGGLE_RIGHT_SIDEBAR) {
          this.rightSidebar.toggle();
        }
      });

  }

  onClickTextChatButton() {
    if (this.textChat.isOpen) {
      this.textChat.close();
    } else {
      this.textChat.open(TextChatCoreComponent, 'projectPage');
    }
  }

  get unReadMessage(): number | string {
    return this.textChat.unReadMessage;
  }

  get isProjectPage(): boolean {
    return this.router.url.split(';')[0] === '/project';
  }
}
