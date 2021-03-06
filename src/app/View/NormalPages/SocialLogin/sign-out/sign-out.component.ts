import { Component, OnInit } from '@angular/core';
import {AuthRequestService} from '../../../../Controller/SocialLogin/auth-request/auth-request.service';

@Component({
  selector: 'app-sign-out',
  templateUrl: './sign-out.component.html',
  styleUrls: ['./sign-out.component.css']
})
export class SignOutComponent implements OnInit {

  constructor(
    public authService:AuthRequestService
  ) {
    authService.signOut();
  }

  ngOnInit() {
  }

}
