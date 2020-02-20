import {Component, OnInit, ViewChild} from '@angular/core';
import {
  GachiSidebarEvent,
  GachiSidebarEventEnum
} from '../../../Model/NormalPagesManager/gachi-sidebar-manager/GachiSidebarEvent/GachiSidebarEvent';
import {GachiSidebarManagerService} from '../../../Model/NormalPagesManager/gachi-sidebar-manager/gachi-sidebar-manager.service';
import {MatSidenav} from '@angular/material/sidenav';

@Component({
  selector: 'app-home-page',
  templateUrl: './home-page.component.html',
  styleUrls: ['./home-page.component.css', './../gachi-font.css']
})
export class HomePageComponent implements OnInit {
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
