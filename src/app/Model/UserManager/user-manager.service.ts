import { Injectable } from '@angular/core';

export class GachiUser{
  name:string;
  constructor(name){
    this.name = name;
  }
}

@Injectable({
  providedIn: 'root'
})
export class UserManagerService {
  private userList:Array<GachiUser>;
  constructor() {
    this.userList = new Array<GachiUser>();
    this.addUser(new GachiUser("Unassigned"));
    this.addUser(new GachiUser("SAKURA"));
    this.addUser(new GachiUser("TOHSAKA"));
    this.addUser(new GachiUser("ARTORIA"));
  }
  getUnassignedUserName(){
    return "Unassigned";
  }
  getUserList(){
    return this.userList;
  }
  addUser(user:GachiUser){
    this.userList.push(user);
  }
  getUserDataByName(userName){
    for(let i = 0 ; i < this.userList.length; i++){
      let currentUser = this.userList[i];
      if(currentUser.name === userName){
        return currentUser
      }
    }
    return null;

  }
  deleteUser(userName:string){
    let index = -1;
    for(let i = 0 ; i < this.userList.length; i++){
      let currentUser = this.userList[i];
      if(currentUser.name === userName){
        index = i;
      }
    }
    if( index >= 0 ){
      this.userList.splice(index, 1);
    }
  }
}
