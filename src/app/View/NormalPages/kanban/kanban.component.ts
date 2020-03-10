import {Component, Inject, OnDestroy, OnInit} from '@angular/core';
import {PopupManagerService} from '../../../Model/PopupManager/popup-manager.service';
import {CdkDragDrop, moveItemInArray, transferArrayItem} from '@angular/cdk/drag-drop';
import {
  KanbanTagListManagerService,
  TagItem
} from '../../../Model/Whiteboard/ProjectSupporter/Kanban/KanbanTagListManager/kanban-tag-list-manager.service';
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
import {KanbanDataDto} from '../../../DTO/ProjectDto/KanbanDataDto/kanban-data-dto';
import {Subscription} from 'rxjs';
import {MAT_DIALOG_DATA, MatDialog, MatDialogRef} from '@angular/material/dialog';

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
export class KanbanComponent implements OnInit, OnDestroy {

  todoGroup:KanbanGroup;
  inProgressGroup:KanbanGroup;
  doneGroup:KanbanGroup;
  isDragging:Boolean = false;

  kanbanGroupWrapper:Array<KanbanGroup>;

  public projectDto:ProjectDto = new ProjectDto();

  constructor(
    public popupManagerService:PopupManagerService,
    public dialogRef: MatDialogRef<KanbanComponent>,
    public tagListMgrService:KanbanTagListManagerService,
    public userManagerService:UserManagerService,
    public htmlHelperService:HtmlHelperService,
    public dialog: MatDialog,
    public kanbanEventManager:KanbanEventManagerService,
    public websocketManagerService:WebsocketManagerService,
    public htmlHelper:HtmlHelperService,
    @Inject(MAT_DIALOG_DATA) public data: KanbanComponentData,
  ) {
    this.kanbanGroupWrapper = new Array<KanbanGroup>();
    this.projectDto = this.websocketManagerService.currentProjectDto;
    this.projectDto.kanbanData = new KanbanDataDto();
    let wsKanbanController = WsKanbanController.getInstance();
    wsKanbanController.requestGetKanban().subscribe((kanbanData:KanbanDataDto)=>{
      this.initComponent(kanbanData);
    });
  }
  public initFlag = false;
  initComponent(kanbanData:KanbanDataDto){
    if (!this.initFlag) {
      this.projectDto.kanbanData = kanbanData;
      this.tagListMgrService.initService(kanbanData);
      this.initKanbanInstance();
      this.subscribeEventEmitter();
      this.initFlag = true;
    }
  }

  initKanbanInstance(){
    this.todoGroup        = new KanbanGroup(KanbanGroupEnum.TODO, "primary");
    this.inProgressGroup  = new KanbanGroup(KanbanGroupEnum.IN_PROGRESS, "accent");
    this.doneGroup        = new KanbanGroup(KanbanGroupEnum.DONE, "warn");
    for(let kanbanItemDto of this.projectDto.kanbanData.todoGroup){
      this.enqueueByWs(kanbanItemDto);
    }
    for(let kanbanItemDto of this.projectDto.kanbanData.inProgressGroup){
      this.enqueueByWs(kanbanItemDto);
    }
    for(let kanbanItemDto of this.projectDto.kanbanData.doneGroup){
      this.enqueueByWs(kanbanItemDto);
    }
    this.kanbanGroupWrapper.push(this.todoGroup);
    this.kanbanGroupWrapper.push(this.inProgressGroup);
    this.kanbanGroupWrapper.push(this.doneGroup);
  }

  ngOnInit() {
  }
  ngOnDestroy(): void {
    if(this.subscription){
      this.subscription.unsubscribe();
    }
  }

  public subscription:Subscription;
  subscribeEventEmitter(){
    this.subscription = this.kanbanEventManager.kanbanEventEmitter.subscribe((kanbanEvent:KanbanEvent)=>{
      switch (kanbanEvent.action) {
        case KanbanEventEnum.CREATE:
          this.enqueueByWs(kanbanEvent.kanbanItemDto);
          break;
        case KanbanEventEnum.UPDATE:
          this.editByWs(kanbanEvent.kanbanItemDto);
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

    let kanbanItem = new KanbanItem(kanbanItemDto.title,null,kanbanItemDto.color);
    kanbanItem.userInfo = UserManagerService.getParticipantByIdToken(kanbanItemDto.userInfo, this.projectDto);
    kanbanItem._id = kanbanItemDto._id;
    kanbanItem.lockedBy = kanbanItemDto.lockedBy;
    if(kanbanItemDto.tagIdList){
      let tagListDto:Array<TagItem> = kanbanItemDto.tagIdList;
      for(let tagItem of tagListDto){
        let newTagItem = new TagItem(tagItem.title, tagItem.color);
        newTagItem._id = tagItem._id;

        kanbanItem.tagList.push(newTagItem);
      }
    }
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
  editByWs(kanbanItemDto:KanbanItemDto){
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
    for(let i = 0 ; i < kanbanGroup.kanbanItemList.length; i++){
      let currItem = kanbanGroup.kanbanItemList[i];

      if(currItem._id === kanbanItemDto._id){
        if(currItem.title !== kanbanItemDto.title){
          currItem.title = kanbanItemDto.title;
        }
        if (currItem.getColor() !== kanbanItemDto.color) {
          currItem.setColor(kanbanItemDto.color);
        }
        if(currItem.userInfo.idToken !== kanbanItemDto.userInfo){
          currItem.userInfo = this.userManagerService.getUserDataByIdToken(kanbanItemDto.userInfo);
        }

        if(kanbanItemDto.tagIdList){
          let tagListDto:Array<TagItem> = kanbanItemDto.tagIdList;
          currItem.tagList.splice(0, currItem.tagList.length);
          for(let tagItem of tagListDto){
            let newTagItem = new TagItem(tagItem.title, tagItem.color);
            newTagItem._id = tagItem._id;

            currItem.tagList.push(newTagItem);
          }
        }

        break;
      }
    }

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
  relocateByWs(kanbanItemDto:KanbanItemDto, additionalData){
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
  onCreateItem(paramGroup){
    const dialogRef = this.dialog.open(KanbanItemCreateComponent, {
      width: '480px',
      data: {kanbanGroup: paramGroup}
    });

    dialogRef.afterClosed().subscribe((result) => {
      if(result){
        console.log("KanbanComponent >>  >> result : ",result);
        if(!result.createFlag){
          return;
        }
        if(result.kanbanItem.title && result.kanbanItem.userInfo && result.kanbanItem.color !== 0){
          this.enqueueTo(result.kanbanItem, result.kanbanGroup);
        }

      }
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
  onEditBtnClick(kanbanItem, kanbanGroup){
    const dialogRef = this.dialog.open(KanbanItemEditComponent, {
      width: '480px',
      data: {
        kanbanItem: kanbanItem,
        kanbanGroup:kanbanGroup
      }
    });

    dialogRef.afterClosed().subscribe((result) => {
      let wsKanbanController = WsKanbanController.getInstance();
      wsKanbanController.requestUnlockKanban(kanbanItem, kanbanGroup);
    });
  }


  onContextBtnClick( operation, kanbanItem, kanbanGroup){
    let wsKanbanController = WsKanbanController.getInstance();
    let subscription:Subscription = wsKanbanController.waitRequestLockKanban(kanbanItem, kanbanGroup)
      .subscribe(()=>{
        console.log("KanbanComponent >> onContextBtnClick >> 진입함");
        switch (operation) {
          case "edit":
            this.onEditBtnClick(kanbanItem, kanbanGroup);
            break;
          case "delete":
            this.deleteFrom(kanbanItem, kanbanGroup);
            break;
        }
        subscription.unsubscribe();
      },(err)=>{
        console.warn("KanbanComponent >> onContextBtnClick >> err : ",err);
        subscription.unsubscribe();
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

  getGroupNameById(id){
    let tokenizedId = id.split("-");
    let idStr = tokenizedId[3];
    let idNum = Number.parseInt(idStr) % 3;
    switch (idNum) {
      case 0:
        return this.todoGroup.title;
      case 1:
        return this.inProgressGroup.title;
      case 2:
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


  getProfileImg(idToken){
    if(idToken){
      return this.websocketManagerService.getUserInfoByIdToken(idToken).profileImg;
    }
  }
  getUserName(idToken){
    if(idToken) {
      return this.websocketManagerService.getUserInfoByIdToken(idToken).userName;
    }
  }
  checkEditorIsAnotherUser(idToken){
    return this.websocketManagerService.userInfo.idToken !== idToken;
  }
  checkIsLocked(kanbanItem){
    if(!kanbanItem.lockedBy){
      return true;
    }else{
      return !this.checkEditorIsAnotherUser(kanbanItem.lockedBy);
    }
  }

}
