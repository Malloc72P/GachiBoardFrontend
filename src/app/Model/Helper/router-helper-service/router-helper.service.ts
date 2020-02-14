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
  goToMainPage(){
    this.goToTarget("mainpage");
  }
  goToHomePage(){
    this.goToTarget("homepage");
  }
  goToProjectPage(projectId){
    this.router.navigate(["project", {projectId:projectId}]);
  }
  private goToTarget(target){
    this.router.navigate([target]);
  }
}
