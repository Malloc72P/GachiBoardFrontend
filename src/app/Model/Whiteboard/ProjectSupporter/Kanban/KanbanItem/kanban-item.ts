import {TagItem} from '../KanbanTagListManager/kanban-tag-list-manager.service';
import {KanbanItemColor} from '../KanbanItemColorEnumManager/kanban-item-color.service';
import {KanbanItemDto} from '../../../../../DTO/ProjectDto/KanbanDataDto/KanbanGroupDto/KanbanItemDto/kanban-item-dto';
import {ParticipantDto} from '../../../../../DTO/ProjectDto/ParticipantDto/participant-dto';

import {ProjectDto} from '../../../../../DTO/ProjectDto/project-dto';
import {UserManagerService} from '../../../../UserManager/user-manager.service';

export class KanbanItem {
  _id:number;
  title:string;
  userInfo:ParticipantDto;
  private color;
  tagList:Array<TagItem>;
  constructor(title?, userInfo?, color?){
    this.title = title;
    this.userInfo = userInfo;
    this.color = color+"";
    this.tagList = new Array<TagItem>();
  }
  getColor(){
    return KanbanItemColor[this.color].toLowerCase();
  }
  getColorNumber(){
    return this.color;
  }
  setColor(color){
    this.color = color;
  }
  public static createItemByDto(kanbanItemDto:KanbanItemDto, projectDto:ProjectDto) :KanbanItem{
    let newKanbanItem = new KanbanItem(kanbanItemDto.title);
    newKanbanItem.color = kanbanItemDto.color;
    newKanbanItem.userInfo = UserManagerService.getParticipantByIdToken(kanbanItemDto.userInfo, projectDto);

    for(let kanbanTag of projectDto.kanbanData.kanbanTagListDto){
      newKanbanItem.tagList.push(new TagItem(kanbanTag.title, kanbanTag.color));
    }
    return newKanbanItem;
  }

  exportDto(parentGroup){
    let kanbanDto = new KanbanItemDto();
    kanbanDto._id = this._id;
    kanbanDto.userInfo = this.userInfo.idToken;
    kanbanDto.color = this.color;
    kanbanDto.title = this.title;
    kanbanDto.tagIdList = this.tagList;
    kanbanDto.parentGroup = parentGroup;
    return kanbanDto;
  }
}
