import {Component, Input, OnInit} from '@angular/core';
import {AuthRequestService} from '../../../../../Controller/SocialLogin/auth-request/auth-request.service';
import {RouterHelperService} from '../../../../../Model/Helper/router-helper-service/router-helper.service';

@Component({
  selector: 'app-gachi-header',
  templateUrl: './gachi-header.component.html',
  styleUrls: ['./gachi-header.component.css', './../../../gachi-font.css']
})
export class GachiHeaderComponent implements OnInit {
  @Input() headerMode;

  constructor(
    public routerHelperService:RouterHelperService,
    public authRequestService:AuthRequestService,
  ) { }

  ngOnInit() {
    this.authRequestService.protectedApi();
  }

  onLogoClick(){
    this.routerHelperService.goToHomePage();
  }

  isHomeMode(){
    return this.headerMode === "homepage"
  }



}
