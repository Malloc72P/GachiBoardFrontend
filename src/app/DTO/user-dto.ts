export class UserDTO {
  public _id         : string;
  public email      : string;
  public regDate    : Date;
  public idToken    : string;
  public accessToken  : string;
  public userName   : string;
  public profileImg  : string;
  public participatingProjects:Array<any>;


  constructor(_id?: string, email?: string, regDate?: Date, idToken?: string, accessToken?: string, userName?: string, profileImg?: string) {
    this._id = _id;
    this.email = email;
    this.regDate = regDate;
    this.idToken = idToken;
    this.accessToken = accessToken;
    this.userName = userName;
    this.profileImg = profileImg;
  }
}
