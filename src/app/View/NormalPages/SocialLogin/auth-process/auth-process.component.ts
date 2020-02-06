import { Component, OnInit } from '@angular/core';
import { ActivatedRoute, Router } from '@angular/router';
import { AuthRequestService } from '../../../../Controller/SocialLogin/auth-request/auth-request.service';
import {UserDTO} from '../../../../DTO/user-dto';

@Component({
  selector: 'app-auth-process',
  templateUrl: './auth-process.component.html',
  styleUrls: ['./auth-process.component.css']
})
export class AuthProcessComponent implements OnInit {

  constructor(
    private route: ActivatedRoute,
    private router: Router,
    private authRequester: AuthRequestService
  ) { }

  ngOnInit() {
    let authToken = this.route.snapshot.paramMap.get('authToken');
    let idToken     = this.route.snapshot.paramMap.get('idToken');
    let email       = this.route.snapshot.paramMap.get('email');
    let userName    = this.route.snapshot.paramMap.get('userName');
    if(authToken){
      console.log("AuthProcessComponent >> ngOnInit >> authToken : ",authToken);
      this.authRequester.setAuthToken(authToken);

      this.authRequester.protectedApi()
        .subscribe((data:UserDTO)=>{
          this.router.navigate(["mainpage"]);
        });

      //let newUserDto = new UserDTO(idToken,userName,email,authToken);
      //this.authRequester.setUserInfo(newUserDto);
      //console.log("LoginProcessComponent > ngOnInit > param : ", authToken);
    }
    else{
      this.authRequester.signOut();
    }
  }
}
