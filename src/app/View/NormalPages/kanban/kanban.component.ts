import {Component, Inject, OnInit} from '@angular/core';
import {PopupManagerService} from '../../../Model/PopupManager/popup-manager.service';
import {CdkDragDrop, moveItemInArray, transferArrayItem} from '@angular/cdk/drag-drop';
import {MAT_DIALOG_DATA, MatDialog, MatDialogRef} from '@angular/material';
import {KanbanTagListManagerService} from '../../../Model/Whiteboard/ProjectSupporter/Kanban/KanbanTagListManager/kanban-tag-list-manager.service';
import {KanbanItemEditComponent} from './kanban-item-edit/kanban-item-edit.component';
import {UserManagerService} from '../../../Model/UserManager/user-manager.service';
import {KanbanItemCreateComponent} from './kanban-item-create/kanban-item-create.component';
import {KanbanGroup} from '../../../Model/Whiteboard/ProjectSupporter/Kanban/KanbanGroup/kanban-group';
import {KanbanItem} from '../../../Model/Whiteboard/ProjectSupporter/Kanban/KanbanItem/kanban-item';
import {KanbanGroupSettingComponent} from './kanban-group-setting/kanban-group-setting.component';
import {KanbanTagManagementComponent} from './kanban-tag-management/kanban-tag-management.component';
import {HtmlHelperService} from '../../../Model/NormalPagesManager/HtmlHelperService/html-helper.service';
import {ProjectDto} from '../../../DTO/ProjectDto/project-dto';
import {WsKanbanController} from '../../../Controller/Controller-WebSocket/websocket-manager/KanbanWsController/ws-kanban.controller';
import {KanbanItemDto, KanbanGroupEnum} from '../../../DTO/ProjectDto/KanbanDataDto/KanbanGroupDto/KanbanItemDto/kanban-item-dto';
import {KanbanEventManagerService} from '../../../Model/Whiteboard/ProjectSupporter/Kanban/kanban-event-manager.service';
import {KanbanEvent, KanbanEventEnum} from '../../../Model/Whiteboard/ProjectSupporter/Kanban/KanbanEvent/KanbanEvent';
import {WebsocketManagerService} from '../../../Controller/Controller-WebSocket/websocket-manager/websocket-manager.service';
import {WebsocketEvent, WebsocketEventEnum} from '../../../Controller/Controller-WebSocket/websocket-manager/WebsocketEvent/WebsocketEvent';

export class KanbanComponentData {
  projectDto:ProjectDto;
}

@Component({
  selector: 'app-kanban',
  templateUrl: './kanban.component.html',
  styleUrls: ['./kanban.component.css',
    '../popup-pannel-commons.css',
    '../gachi-font.css',
    '../../../../scrolling.scss',
    '../../Whiteboard/project-supporter-pannel/project-supporter-pannel.component.css',]
})
export class KanbanComponent implements OnInit {

  todoGroup:KanbanGroup;
  inProgressGroup:KanbanGroup;
  doneGroup:KanbanGroup;
  isDragging:Boolean = false;

  kanbanGroupWrapper:Array<KanbanGroup>;

  private projectDto:ProjectDto = new ProjectDto();

  constructor(
    private popupManagerService:PopupManagerService,
    public dialogRef: MatDialogRef<KanbanComponent>,
    private tagListMgrService:KanbanTagListManagerService,
    private userManagerService:UserManagerService,
    private htmlHelperService:HtmlHelperService,
    public dialog: MatDialog,
    private kanbanEventManager:KanbanEventManagerService,
    private websocketManagerService:WebsocketManagerService,
    @Inject(MAT_DIALOG_DATA) public data: KanbanComponentData,
  ) {
    this.kanbanGroupWrapper = new Array<KanbanGroup>();
    this.projectDto = this.websocketManagerService.currentProjectDto;
    this.initKanbanInstance();
    this.subscribeEventEmitter();
  }

  initKanbanInstance(){
    this.todoGroup        = new KanbanGroup(KanbanGroupEnum.TODO, "primary");
    this.inProgressGroup  = new KanbanGroup(KanbanGroupEnum.IN_PROGRESS, "accent");
    this.doneGroup        = new KanbanGroup(KanbanGroupEnum.DONE, "warn");
    for(let kanbanItemDto of this.projectDto.kanbanData.todoGroup){
      let newKanbanItem:KanbanItem = KanbanItem.createItemByDto(kanbanItemDto, this.projectDto);
      //this.todoGroup.kanbanItemList.push(newKanbanItem);
      console.log("KanbanComponent >> initKanbanInstance >> kanbanItemDto : ",kanbanItemDto);
      this.enqueueByWs(kanbanItemDto);
    }
    for(let kanbanItemDto of this.projectDto.kanbanData.inProgressGroup){
      let newKanbanItem = KanbanItem.createItemByDto(kanbanItemDto, this.projectDto);
      //this.inProgressGroup.kanbanItemList.push(newKanbanItem);
      this.enqueueByWs(kanbanItemDto);
    }
    for(let kanbanItemDto of this.projectDto.kanbanData.doneGroup){
      let newKanbanItem = KanbanItem.createItemByDto(kanbanItemDto, this.projectDto);
      //this.doneGroup.kanbanItemList.push(newKanbanItem);
      this.enqueueByWs(kanbanItemDto);
    }
    this.kanbanGroupWrapper.push(this.todoGroup);
    this.kanbanGroupWrapper.push(this.inProgressGroup);
    this.kanbanGroupWrapper.push(this.doneGroup);
  }
  subscribeEventEmitter(){
    this.kanbanEventManager.kanbanEventEmitter.subscribe((kanbanEvent:KanbanEvent)=>{
      switch (kanbanEvent.action) {
        case KanbanEventEnum.CREATE:
          this.enqueueByWs(kanbanEvent.kanbanItemDto);
          break;
        case KanbanEventEnum.UPDATE:
          break;
        case KanbanEventEnum.DELETE:
          break;
      }
    });
  }

  enqueueTo(kanbanItem:KanbanItem, kanbanGroup:KanbanGroup){
    kanbanGroup.kanbanItemList.splice(kanbanGroup.kanbanItemList.length, 0, kanbanItem);
    let wsKanbanController = WsKanbanController.getInstance();

    wsKanbanController.requestCreateKanban(kanbanItem, kanbanGroup);
  }
  enqueueByWs(kanbanItemDto:KanbanItemDto){//Ws === Websocket
    console.log("KanbanComponent >> enqueueByWs >> kanbanItemDto : ",kanbanItemDto);
    let kanbanItem = new KanbanItem(kanbanItemDto.title,null,kanbanItemDto.color);
    kanbanItem.userInfo = UserManagerService.getParticipantByIdToken(kanbanItemDto.userInfo, this.projectDto);
    kanbanItem._id = kanbanItemDto._id;
    let groupEnum:KanbanGroupEnum = kanbanItemDto.parentGroup;
    switch (groupEnum) {
      case KanbanGroupEnum.TODO:
        this.todoGroup.kanbanItemList.push(kanbanItem);
        break;
      case KanbanGroupEnum.IN_PROGRESS:
        this.inProgressGroup.kanbanItemList.push(kanbanItem);
        break;
      case KanbanGroupEnum.DONE:
        this.doneGroup.kanbanItemList.push(kanbanItem);
        break;
    }
  }
  deleteFrom(kanbanItem:KanbanItem, kanbanGroup:KanbanGroup){
    let index = -1;
    index = kanbanGroup.kanbanItemList.indexOf(kanbanItem);
    if(index >= 0){
      kanbanGroup.kanbanItemList.splice(index, 1);
      let wsKanbanController = WsKanbanController.getInstance();

      wsKanbanController.requestDeleteKanban(kanbanItem, kanbanGroup);
    }
  }
  deleteByWs(kanbanItemDto:KanbanItemDto){

    let kanbanGroup:KanbanGroup;
    let groupEnum:KanbanGroupEnum = kanbanItemDto.parentGroup;
    switch (groupEnum) {
      case KanbanGroupEnum.TODO:
        kanbanGroup = this.todoGroup;
        break;
      case KanbanGroupEnum.IN_PROGRESS:
        kanbanGroup = this.inProgressGroup;
        break;
      case KanbanGroupEnum.DONE:
        kanbanGroup = this.doneGroup;
        break;
    }
    let index = -1;
    /*
    index = kanbanGroup.kanbanItemList.indexOf(kanbanItem);

    if(index >= 0){
      kanbanGroup.kanbanItemList.splice(index, 1);
      let wsKanbanController = WsKanbanController.getInstance();

      wsKanbanController.requestDeleteKanban(kanbanItem, kanbanGroup);
    }*/
  }

  ngOnInit() {
  }

  drop(event: CdkDragDrop<string[]>) {
    console.log("KanbanComponent >> drop >> 진입함");
    if (event.previousContainer === event.container) {
      console.log("KanbanComponent >> drop >> 이전 컨테이너와 현재 컨네이너가 동일");
      moveItemInArray(event.container.data, event.previousIndex, event.currentIndex);
    } else {
      console.log("KanbanComponent >> drop >> 이전과 현재 컨테이너가 다름.");
      transferArrayItem(event.previousContainer.data,
        event.container.data,
        event.previousIndex,
        event.currentIndex);
    }
  }

  onNoClick(): void {
    this.dialogRef.close();
  }
  onEditBtnClick(item){
    const dialogRef = this.dialog.open(KanbanItemEditComponent, {
      width: '480px',
      data: {kanbanItem: item}
    });

    dialogRef.afterClosed().subscribe((result) => {
      console.log("KanbanComponent >>  >> result : ",result);
    });
  }
  onCreateItem(group){
    const dialogRef = this.dialog.open(KanbanItemCreateComponent, {
      width: '480px',
      data: {kanbanGroup: group}
    });

    dialogRef.afterClosed().subscribe((result) => {
      this.enqueueTo(result.kanbanItem, result.kanbanGroup);
    });

  }
  onKanbanGroupSetting(){
    const dialogRef = this.dialog.open(KanbanGroupSettingComponent, {
      width: '480px',
      data: {groups: this.kanbanGroupWrapper}
    });

    dialogRef.afterClosed().subscribe((result) => {
      console.log("KanbanComponent >>  >> result : ",result);
    });

  }
  onTagManagement(){
    const dialogRef = this.dialog.open(KanbanTagManagementComponent, {
      width: '540px',
      data: {}
    });

    dialogRef.afterClosed().subscribe((result) => {
      console.log("KanbanComponent >>  >> result : ",result);
    });

  }


}
