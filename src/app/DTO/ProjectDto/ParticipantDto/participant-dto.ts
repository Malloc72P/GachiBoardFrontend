import {AuthorityLevel} from './authority-level.enum';

export class ParticipantDto {
  public _id;
  public authorityLevel:AuthorityLevel;
  public startDate:Date;
  public idToken    : string;
  public email      : string;
  public userName   : string;
  public profileImg : string;

  public static createUnknownParticipant(){
    let unknown = new ParticipantDto();
    unknown._id = -1;
    unknown.authorityLevel = AuthorityLevel.NORMAL;
    unknown.startDate = new Date();
    unknown.idToken = "-1";
    unknown.email = "-1";
    unknown.userName = "unknown";
    unknown.profileImg = "/assets/images/supporter/kanban/male.jpg";
    return unknown;
  }
}
