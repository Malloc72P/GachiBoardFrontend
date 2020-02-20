import {Component, Input, OnInit} from '@angular/core';
import {GachiSidebarManagerService} from '../../../../../Model/NormalPagesManager/gachi-sidebar-manager/gachi-sidebar-manager.service';
import {AuthRequestService} from '../../../../../Controller/SocialLogin/auth-request/auth-request.service';
import {UserDTO} from '../../../../../DTO/user-dto';
import {AuthEvent} from '../../../../../Controller/SocialLogin/auth-request/AuthEvent/AuthEvent';

@Component({
  selector: 'app-gachi-main-header',
  templateUrl: './gachi-main-header.component.html',
  styleUrls: ['./gachi-main-header.component.css', './../../../gachi-font.css']
})
export class GachiMainHeaderComponent implements OnInit {
  private isToggled = true;
  @Input() userName;
  constructor(
    private sidebarManagerService:GachiSidebarManagerService,
  ) {

  }

  ngOnInit() {
  }

  openLeftSidebar(){
    this.isToggled = !this.isToggled;
    this.sidebarManagerService.toggleLeftSidebar();
  }

}
