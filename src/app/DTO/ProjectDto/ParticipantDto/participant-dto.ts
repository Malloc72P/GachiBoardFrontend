import {AuthorityLevel} from './authority-level.enum';

export class ParticipantDto {
  public _id;
  public authorityLevel:AuthorityLevel;
  public startDate:Date;
  public idToken    : string;
  public email      : string;
  public userName   : string;
  public profileImg : string;
  public state      : ParticipantState;

  public static createUnknownParticipant(){
    let unknown = new ParticipantDto();
    unknown._id = -1;
    unknown.authorityLevel = AuthorityLevel.NORMAL;
    unknown.startDate = new Date();
    unknown.idToken = "-1";
    unknown.email = "-1";
    unknown.userName = "unknown";
    unknown.profileImg = "/assets/images/supporter/kanban/male.jpg";
    unknown.state = ParticipantState.AVAIL;
    return unknown;
  }
  public static clone(participantDto:ParticipantDto){
    let cloneData:ParticipantDto = new ParticipantDto();
    cloneData._id             = participantDto._id;
    cloneData.authorityLevel  = participantDto.authorityLevel;
    cloneData.startDate       = participantDto.startDate;
    cloneData.idToken         = participantDto.idToken;
    cloneData.email           = participantDto.email;
    cloneData.userName        = participantDto.userName;
    cloneData.profileImg      = participantDto.profileImg;
    cloneData.state           = participantDto.state;

    return cloneData;
  }
}

export enum ParticipantState {
  AVAIL,
  NOT_AVAIL,
}

