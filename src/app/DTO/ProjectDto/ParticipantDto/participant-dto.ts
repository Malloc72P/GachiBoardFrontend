import {AuthorityLevel} from './authority-level.enum';

export class ParticipantDto {
  public _id;
  public authorityLevel:AuthorityLevel;
  public startDate:Date;
  public idToken    : string;
  public email      : string;
  public userName   : string;
  public profileImg : string;

}
