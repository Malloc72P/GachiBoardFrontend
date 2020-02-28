import {Component, OnInit} from '@angular/core';
import { HttpHelper } from '../../../../Model/Helper/http-helper/http-helper';
import {AuthRequestService} from '../../../../Controller/SocialLogin/auth-request/auth-request.service';

@Component({
  selector: 'app-auth-page',
  templateUrl: './login-page.component.html',
  styleUrls: [
    './login-page.component.css',
    "./login-page.component.scss"
  ]
})
export class LoginPageComponent implements OnInit {
  myStyle: object = {};
  myParams: object = {};
  width: number = 100;
  height: number = 100;
  public readonly particleColor = '#EF2938';
  public readonly universalOpacity = 0.3;
  public readonly particleOpacity = this.universalOpacity;
  public readonly lineOpacity = this.universalOpacity;
  public readonly repulseDistance = 150;
  public readonly particleWidth = 8;
  public readonly lineWidth = 2;
  public readonly linkDistance = 300;
  public readonly opacityMin = 1;

  constructor(
    public apiRequester: AuthRequestService
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
