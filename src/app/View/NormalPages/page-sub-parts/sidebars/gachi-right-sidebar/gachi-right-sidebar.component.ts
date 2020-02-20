import {Component, OnInit} from '@angular/core';
import {GachiSidebarManagerService} from '../../../../../Model/NormalPagesManager/gachi-sidebar-manager/gachi-sidebar-manager.service';
import {AuthEvent, AuthEventEnum} from '../../../../../Controller/SocialLogin/auth-request/AuthEvent/AuthEvent';
import {AuthRequestService} from '../../../../../Controller/SocialLogin/auth-request/auth-request.service';

@Component({
  selector: 'app-gachi-right-sidebar',
  templateUrl: './gachi-right-sidebar.component.html',
  styleUrls: ['./gachi-right-sidebar.component.css', './../../../gachi-font.css']
})
export class GachiRightSidebarComponent implements OnInit {
  private isLoggedIn = false;
  constructor(
    private sidebarManagerService:GachiSidebarManagerService,
    private authService:AuthRequestService,) {

  }

  ngOnInit() {
    this.isLoggedIn = this.authService.checkLoggedInUser();
    this.authService.authEventEmitter.subscribe((authEvent:AuthEvent)=>{
      switch (authEvent.action) {
        case AuthEventEnum.SIGN_OUT:
          this.isLoggedIn = false;
          break;
        case AuthEventEnum.SIGN_IN:
          this.isLoggedIn = true;
          break;

      }
    })

  }

}
