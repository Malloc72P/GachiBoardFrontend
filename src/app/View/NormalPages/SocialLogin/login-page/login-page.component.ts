import {Component, OnInit} from '@angular/core';
import { HttpHelper } from '../../../../Model/Helper/http-helper/http-helper';
import {AuthRequestService} from '../../../../Controller/SocialLogin/auth-request/auth-request.service';
import {transition, trigger, useAnimation} from '@angular/animations';
import {bounce, bounceIn, bounceInLeft, fadeIn, flipInX, flipInY, jackInTheBox, jello, slideInDown, tada} from 'ng-animate';
import {HtmlHelperService} from '../../../../Model/NormalPagesManager/HtmlHelperService/html-helper.service';
export enum Provider {
  Google, Kakao, Naver
}
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
  googleProvider:Provider = Provider.Google;
  kakaoProvider:Provider = Provider.Kakao;
  naverProvider:Provider = Provider.Naver;

  constructor(
    public apiRequester: AuthRequestService,
    public htmlHelper:HtmlHelperService
  ) {
  }

  ngOnInit() {
  }

  // Method to sign in with social account
  signIn(platform: Provider): void {
    switch (platform) {
      case Provider.Google:
        HttpHelper.redirectTo(HttpHelper.api.authGoogle.uri);
        break;
      case Provider.Kakao:
        HttpHelper.redirectTo(HttpHelper.api.authKakao.uri);
        break;
      case Provider.Naver:
        HttpHelper.redirectTo(HttpHelper.api.authNaver.uri);
        break;

    }
  }

  // Method to sign out
  signOut(): void {
    this.apiRequester.signOut();
  }
}
