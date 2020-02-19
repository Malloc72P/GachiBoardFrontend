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

@Component({
  selector: 'app-main-page',
  templateUrl: './main-page.component.html',
  styleUrls: ['./main-page.component.css', './../gachi-font.css']
})
export class MainPageComponent implements OnInit {
  @ViewChild('mainLeftDrawer', {static: true}) mainLeftDrawer;
  @ViewChild('drawer', {static: true}) rightSidebar:MatSidenav;
  public userName = "";
  public userDto = new UserDTO();
  constructor(
    public authRequestService:AuthRequestService,
    public routerHelperService:RouterHelperService,
    public sidebarManagerService:GachiSidebarManagerService
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
        console.log("GachiLeftSidebarComponent >> subscribe >> event : ",event);
        if (event.action === GachiSidebarEventEnum.TOGGLE_LEFT_SIDEBAR) {
          this.mainLeftDrawer.toggle();
        }
        else if (event.action === GachiSidebarEventEnum.TOGGLE_RIGHT_SIDEBAR) {
          this.rightSidebar.toggle();
        }
      });

  }



}
