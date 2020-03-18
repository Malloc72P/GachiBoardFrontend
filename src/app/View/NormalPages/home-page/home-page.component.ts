import {Component, OnInit, ViewChild} from '@angular/core';
import {
  GachiSidebarEvent,
  GachiSidebarEventEnum
} from '../../../Model/NormalPagesManager/gachi-sidebar-manager/GachiSidebarEvent/GachiSidebarEvent';
import {GachiSidebarManagerService} from '../../../Model/NormalPagesManager/gachi-sidebar-manager/gachi-sidebar-manager.service';
import {MatSidenav} from '@angular/material/sidenav';
import {transition, trigger, useAnimation} from '@angular/animations';
import {fadeIn} from 'ng-animate';
import {RouterHelperService} from '../../../Model/Helper/router-helper-service/router-helper.service';

@Component({
  selector: 'app-home-page',
  templateUrl: './home-page.component.html',
  styleUrls: ['./home-page.component.css', './../gachi-font.css'],
  animations: [trigger('fadeIn',
    [transition('* => *', useAnimation(fadeIn,
    {params : {timing : 1.5, delay : 0}}))])]
})
export class HomePageComponent implements OnInit {
  fadeIn:any;
  @ViewChild('drawer', {static: true}) rightSidebar:MatSidenav;

  constructor(public sidebarManagerService:GachiSidebarManagerService,
              public routerHelperService:RouterHelperService) { }

  ngOnInit() {
    this.sidebarManagerService.sidebarEventEmitter
      .subscribe((event:GachiSidebarEvent)=>{
        if (event.action === GachiSidebarEventEnum.TOGGLE_RIGHT_SIDEBAR) {
          this.rightSidebar.toggle();
        }
      });

  }

  onJoinGachiBtnClick(){
    let accessToken = localStorage.getItem('accessToken');
    if(accessToken){
      this.routerHelperService.goToMainPage();
    }else this.routerHelperService.goToLoginPage();
  }

}
