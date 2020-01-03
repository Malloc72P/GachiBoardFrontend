import { Component, OnInit } from '@angular/core';
import { ActivatedRoute, Router } from '@angular/router';
import { AuthRequestService } from '../../../Controller/SocialLogin/auth-request/auth-request.service';

@Component({
  selector: 'app-auth-process',
  templateUrl: './auth-process.component.html',
  styleUrls: ['./auth-process.component.css']
})
export class AuthProcessComponent implements OnInit {

  constructor(
    private route: ActivatedRoute,
    private router: Router,
    private apiRequester: AuthRequestService
  ) { }

  ngOnInit() {
    let accessToken = this.route.snapshot.paramMap.get('authToken');
    let idToken = this.route.snapshot.paramMap.get('idToken');
    let email = this.route.snapshot.paramMap.get('email');
    let userName = this.route.snapshot.paramMap.get('userName');
    if(accessToken){
      this.apiRequester.setAccessToken(accessToken);
      this.apiRequester.setUserInfo({
        userName  :  userName,
        email     :  email,
        idToken   :  idToken,
        authToken :  accessToken
      });
    }
    else{
      this.router.navigate(["sign-in-out"]);
    }
    console.log("LoginProcessComponent > ngOnInit > param : ", accessToken);
    this.router.navigate(["whiteboard"]);
  }
}
