import { Injectable } from '@angular/core';
import { Router } from '@angular/router';

@Injectable({
  providedIn: 'root'
})
export class RouterHelperService {

  constructor(
    private router: Router
  ) { }

  goToWhiteboard(){
    this.goToTarget("whiteboard");
  }
  goToLoginPage(){
    this.goToTarget("login");
  }
  goToHomePage(){
    this.goToTarget("homepage");
  }
  private goToTarget(target){
    this.router.navigate([target]);
  }
}
