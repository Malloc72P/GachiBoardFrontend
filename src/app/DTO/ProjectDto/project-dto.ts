import {KanbanDataDto} from './KanbanDataDto/kanban-data-dto';
import {ParticipantDto} from './ParticipantDto/participant-dto';
import {WhiteboardSessionDto} from './WhiteboardSessionDto/whiteboard-session-dto';

export class ProjectDto {
  public _id;
  public projectTitle;
  public createdBy;
  public startDate;
  public kanbanData:KanbanDataDto;
  public participantList:Array<ParticipantDto>;
  public whiteboardSessionList:Array<WhiteboardSessionDto>;

  constructor(){
    this.kanbanData = new KanbanDataDto();
    this.participantList = new Array<ParticipantDto>();
    this.whiteboardSessionList = new Array<WhiteboardSessionDto>();
  }

}
