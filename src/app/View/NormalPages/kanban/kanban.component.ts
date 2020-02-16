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
          this.deleteByWs(kanbanEvent.kanbanItemDto);
          break;
          case KanbanEventEnum.LOCK:
            this.lockedByWs(kanbanEvent.kanbanItemDto);
          break;
          case KanbanEventEnum.UNLOCK:
            this.unlockedByWs(kanbanEvent.kanbanItemDto);
          break;
          case KanbanEventEnum.RELOCATE:
            this.relocateByWs(kanbanEvent.kanbanItemDto, kanbanEvent.data);
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
    kanbanItem.lockedBy = kanbanItemDto.lockedBy;
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
    for(let i = 0 ; i < kanbanGroup.kanbanItemList.length; i++){
      let currItem = kanbanGroup.kanbanItemList[i];

      if(currItem._id === kanbanItemDto._id){
        index = i;
        break;
      }
    }

    if(index >= 0){
      kanbanGroup.kanbanItemList.splice(index, 1);
    }
  }

  ngOnInit() {
  }

  drop(event: CdkDragDrop<string[]>) {

    let prevContainerName = this.getGroupNameById(event.previousContainer.id);
    let currContainerName = this.getGroupNameById(event.container.id);


    let prevKanbanItem:KanbanItem = event.previousContainer.data[event.previousIndex] as unknown as KanbanItem;
    let currKanbanItem:KanbanItem = event.container.data[event.currentIndex] as unknown as KanbanItem;

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

    let wsKanbanController = WsKanbanController.getInstance();
    wsKanbanController.requestRelocationKanban(prevKanbanItem,prevContainerName,currContainerName,event.currentIndex);
    //prevKanbanItem이 currKanbanItem의 위치를 대신하도록 요청한다.
    //만약 currKanbanItem이 null이라면, 그건 재배치하는 위치에 칸반아이템이 없는 경우라서 그런 것임.
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

  requestLock(kanbanItem, kanbanGroup){
    console.log("KanbanComponent >> requestLock >> kanbanItem : ",kanbanItem);
    if(kanbanItem.lockedBy){
      return;
    }
    let wsKanbanController = WsKanbanController.getInstance();
    wsKanbanController.requestLockKanban(kanbanItem, kanbanGroup);
  }
  requestRelease(kanbanItem, kanbanGroup){
    console.log("KanbanComponent >> requestLock >> kanbanItem : ",kanbanItem);
    if(!kanbanItem.lockedBy){
      return;
    }
    let wsKanbanController = WsKanbanController.getInstance();
    wsKanbanController.requestUnlockKanban(kanbanItem, kanbanGroup);
  }
  lockedByWs(kanbanItemDto){
    let groupEnum:KanbanGroupEnum = kanbanItemDto.parentGroup as KanbanGroupEnum;

    let targetGroup:KanbanGroup = null;

    switch (groupEnum) {
      case KanbanGroupEnum.TODO:
        targetGroup = this.todoGroup;
        break;
      case KanbanGroupEnum.IN_PROGRESS:
        targetGroup = this.inProgressGroup;
        break;
      case KanbanGroupEnum.DONE:
        targetGroup = this.doneGroup;
        break;
      default :
        return;
    }
    for(let i = 0 ; i < targetGroup.kanbanItemList.length; i++){
      let currItem = targetGroup.kanbanItemList[i];

      if(currItem._id === kanbanItemDto._id){
        currItem.lockedBy = kanbanItemDto.lockedBy;
        break;
      }
    }

  }
  unlockedByWs(kanbanItemDto){
    let groupEnum:KanbanGroupEnum = kanbanItemDto.parentGroup as KanbanGroupEnum;

    let targetGroup:KanbanGroup = null;

    switch (groupEnum) {
      case KanbanGroupEnum.TODO:
        targetGroup = this.todoGroup;
        break;
      case KanbanGroupEnum.IN_PROGRESS:
        targetGroup = this.inProgressGroup;
        break;
      case KanbanGroupEnum.DONE:
        targetGroup = this.doneGroup;
        break;
      default :
        return;
    }
    for(let i = 0 ; i < targetGroup.kanbanItemList.length; i++){
      let currItem = targetGroup.kanbanItemList[i];

      if(currItem._id === kanbanItemDto._id){
        currItem.lockedBy = kanbanItemDto.lockedBy;
        break;
      }
    }

  }

  getGroupNameById(id){
    switch (id) {
      case "cdk-drop-list-0":
        return this.todoGroup.title;
      case "cdk-drop-list-1":
        return this.inProgressGroup.title;
      case "cdk-drop-list-2":
        return this.doneGroup.title;
    }
  }
  getGroupObjectByTitle(title:KanbanGroupEnum) : KanbanGroup{
    switch (title) {
      case KanbanGroupEnum.TODO:
        return this.todoGroup;
      case KanbanGroupEnum.IN_PROGRESS:
        return this.inProgressGroup;
      case KanbanGroupEnum.DONE:
        return this.doneGroup;
    }
  }

  relocateByWs(kanbanItemDto:KanbanItemDto, additionalData){
    console.log("KanbanComponent >> relocateByWs >> 진입함");
    let destGroupTitle = additionalData.destGroupTitle;
    let destIdx = additionalData.destIdx;

    let fromGroup:KanbanGroup, toGroup:KanbanGroup;
    fromGroup = this.getGroupObjectByTitle(kanbanItemDto.parentGroup);
    toGroup = this.getGroupObjectByTitle(destGroupTitle);

    let kanbanItem:KanbanItem;
    let previousIndex = -1;
    for (let i = 0; i < fromGroup.kanbanItemList.length; i++) {
      let currItem = fromGroup.kanbanItemList[i];
      if(currItem._id === kanbanItemDto._id){
        kanbanItem = currItem;
        kanbanItem.lockedBy = kanbanItemDto.lockedBy;
        previousIndex = i;
        break;
      }
    }

    let currentIndex = -1;
    if(toGroup.kanbanItemList.length <= destIdx){//재배치될 위치가 그룹 배열크기를 초과하는 경우 enqueue함
      currentIndex = toGroup.kanbanItemList.length;
    }else{
      currentIndex = destIdx;
    }

    if (kanbanItemDto.parentGroup === destGroupTitle) {
      console.log("KanbanComponent >> drop >> 이전 컨테이너와 현재 컨네이너가 동일");
      moveItemInArray(toGroup.kanbanItemList, previousIndex, currentIndex);
    } else {
      console.log("KanbanComponent >> drop >> 이전과 현재 컨테이너가 다름.");
      transferArrayItem(fromGroup.kanbanItemList,
        toGroup.kanbanItemList,
        previousIndex,
        currentIndex);
    }

  }

  getProfileImg(idToken){
    if(idToken){
      return this.userManagerService.getUserDataByIdToken(idToken).profileImg;
    }
  }
  getUserName(idToken){
    if(idToken) {
      return this.userManagerService.getUserDataByIdToken(idToken).userName;
    }
  }
  checkEditorIsAnotherUser(idToken){
    return this.websocketManagerService.userInfo.idToken !== idToken;
  }

}
