import {Component, Input, OnInit} from '@angular/core';
import {KanbanItem} from '../../../../../Model/Whiteboard/ProjectSupporter/Kanban/KanbanItem/kanban-item';
import {KanbanItemDto} from '../../../../../DTO/ProjectDto/KanbanDataDto/KanbanGroupDto/KanbanItemDto/kanban-item-dto';
import {UserManagerService} from '../../../../../Model/UserManager/user-manager.service';

@Component({
  selector: 'app-kanban-card',
  templateUrl: './kanban-card.component.html',
  styleUrls: ['./kanban-card.component.css', './../../../gachi-font.css']
})
export class KanbanCardComponent implements OnInit {
  @Input() kanbanItemDto:KanbanItemDto;
  constructor(
    public userManagerService:UserManagerService
  ) { }

  ngOnInit() {
  }

  getProfileImg(){
    return this.userManagerService.getUserDataByIdToken(this.kanbanItemDto.userInfo).profileImg;
  }
  getUserName(){
    return this.userManagerService.getUserDataByIdToken(this.kanbanItemDto.userInfo).userName;
  }

}
