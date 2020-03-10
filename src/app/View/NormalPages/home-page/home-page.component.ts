import {Component, OnInit, ViewChild} from '@angular/core';
import {
  GachiSidebarEvent,
  GachiSidebarEventEnum
} from '../../../Model/NormalPagesManager/gachi-sidebar-manager/GachiSidebarEvent/GachiSidebarEvent';
import {GachiSidebarManagerService} from '../../../Model/NormalPagesManager/gachi-sidebar-manager/gachi-sidebar-manager.service';
import {MatSidenav} from '@angular/material/sidenav';
import {transition, trigger, useAnimation} from '@angular/animations';
import {fadeIn} from 'ng-animate';

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

  constructor(public sidebarManagerService:GachiSidebarManagerService) { }

  ngOnInit() {
    this.sidebarManagerService.sidebarEventEmitter
      .subscribe((event:GachiSidebarEvent)=>{
        if (event.action === GachiSidebarEventEnum.TOGGLE_RIGHT_SIDEBAR) {
          this.rightSidebar.toggle();
        }
      });

  }

}
