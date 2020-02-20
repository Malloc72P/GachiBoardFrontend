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
  private readonly particleColor = '#EF2938';
  private readonly universalOpacity = 0.3;
  private readonly particleOpacity = this.universalOpacity;
  private readonly lineOpacity = this.universalOpacity;
  private readonly repulseDistance = 150;
  private readonly particleWidth = 8;
  private readonly lineWidth = 2;
  private readonly linkDistance = 300;
  private readonly opacityMin = 1;

  constructor(
    private apiRequester: AuthRequestService
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
