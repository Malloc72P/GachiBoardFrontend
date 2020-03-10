import { Component, OnInit } from '@angular/core';
import {ActivatedRoute} from '@angular/router';
import {HttpHelper} from '../../../Model/Helper/http-helper/http-helper';
import {RouterHelperService} from '../../../Model/Helper/router-helper-service/router-helper.service';

@Component({
  selector: 'app-invitation',
  templateUrl: './invitation.component.html',
  styleUrls: ['./invitation.component.css']
})
export class InvitationComponent implements OnInit {

  constructor(
    public route: ActivatedRoute,
    public routerHelper:RouterHelperService,
  ) {
    let inviteCode = this.route.snapshot.paramMap.get('inviteCode');

    localStorage.setItem("inviteCode", inviteCode);
    let accessToken = localStorage.getItem('accessToken');
    if(accessToken){
      this.routerHelper.goToMainPage();
    }else this.routerHelper.goToLoginPage();
    // HttpHelper.redirectTo(HttpHelper.api.authGoogle.uri);
  }

  ngOnInit() {
  }

}
