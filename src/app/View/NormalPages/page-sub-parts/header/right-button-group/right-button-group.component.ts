import {Component, Input, OnInit} from '@angular/core';
import {AuthRequestService} from '../../../../../Controller/SocialLogin/auth-request/auth-request.service';
import {RouterHelperService} from '../../../../../Model/Helper/router-helper-service/router-helper.service';
import {AuthEvent, AuthEventEnum} from '../../../../../Controller/SocialLogin/auth-request/AuthEvent/AuthEvent';
import {GachiSidebarManagerService} from '../../../../../Model/NormalPagesManager/gachi-sidebar-manager/gachi-sidebar-manager.service';

@Component({
  selector: 'app-right-button-group',
  templateUrl: './right-button-group.component.html',
  styleUrls: ['./right-button-group.component.css']
})
export class RightButtonGroupComponent implements OnInit {
  @Input() headerMode;
  constructor(
    public authService:AuthRequestService,
    public routerHelperService:RouterHelperService,
    public sidebarManagerService:GachiSidebarManagerService
  ) { }

  public isLoggedIn = false;

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

  public toggleRightSidebar(){
    this.sidebarManagerService.toggleRightSidebar();
  }

  public onSignOutClick(){
    this.authService.signOut();
  }
  public onLogoClick(){
    this.routerHelperService.goToHomePage();
  }

}
