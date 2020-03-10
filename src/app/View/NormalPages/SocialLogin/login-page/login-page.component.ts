import {Component, OnInit} from '@angular/core';
import { HttpHelper } from '../../../../Model/Helper/http-helper/http-helper';
import {AuthRequestService} from '../../../../Controller/SocialLogin/auth-request/auth-request.service';
import {transition, trigger, useAnimation} from '@angular/animations';
import {bounce, bounceIn, bounceInLeft, fadeIn, flipInX, flipInY, jackInTheBox, jello, slideInDown, tada} from 'ng-animate';
import {HtmlHelperService} from '../../../../Model/NormalPagesManager/HtmlHelperService/html-helper.service';

@Component({
  selector: 'app-auth-page',
  templateUrl: './login-page.component.html',
  styleUrls: [
    './login-page.component.css',
    './../../gachi-font.css',
    "./login-page.component.scss"
  ],
  animations: [trigger('fadeIn',
    [transition('* => *', useAnimation(fadeIn,
      {params : {timing : 1, delay : 0}}))])]
})
export class LoginPageComponent implements OnInit {
  fadeIn:any;

  constructor(
    public apiRequester: AuthRequestService,
    public htmlHelper:HtmlHelperService
  ) {
  }

  ngOnInit() {
  }

  // Method to sign in with social account
  signIn(platform: string): void {
    HttpHelper.redirectTo(HttpHelper.api.authGoogle.uri);
  }

  // Method to sign out
  signOut(): void {
    this.apiRequester.signOut();
  }
}
