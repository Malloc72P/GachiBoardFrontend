import { Injectable } from '@angular/core';
import { Router } from '@angular/router';

@Injectable({
  providedIn: 'root'
})
export class RouterHelperService {

  constructor(
    private router: Router
  ) { }

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
  goToWhiteboardPage(projectId, wbSessionId){
    //this.router.navigate(["whiteboard", {wbSessionId:wbSessionId}]);
    console.log("RouterHelperService >> goToWhiteboardPage >> projectId : ",projectId);
    console.log("RouterHelperService >> goToWhiteboardPage >> wbSessionId : ",wbSessionId);
    document.location.href = "/whiteboard?"+"projectId="+projectId+"&"+"wbSessionId="+wbSessionId;
  }
  private goToTarget(target){
    this.router.navigate([target]);
  }
}
