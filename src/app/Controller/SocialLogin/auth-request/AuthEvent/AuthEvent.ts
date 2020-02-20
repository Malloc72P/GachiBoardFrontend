import {UserDTO} from '../../../../DTO/user-dto';

export enum AuthEventEnum {
  SIGN_OUT,
  SIGN_IN
}

export class AuthEvent {
  public action:AuthEventEnum;
  public userInfo:UserDTO;

  constructor(action: AuthEventEnum, userInfo: UserDTO) {
    this.action = action;
    this.userInfo = userInfo;
  }
}
