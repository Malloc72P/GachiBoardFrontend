import {GachiUser} from '../../../../UserManager/user-manager.service';
import {TagItem} from '../KanbanTagListManager/kanban-tag-list-manager.service';
import {KanbanItemColor} from '../KanbanItemColorEnumManager/kanban-item-color.service';

export class KanbanItem {
  id:number;
  title:string;
  userInfo:GachiUser;
  private color;
  tagList:Array<TagItem>;
  constructor(title, userInfo, color){
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
}
