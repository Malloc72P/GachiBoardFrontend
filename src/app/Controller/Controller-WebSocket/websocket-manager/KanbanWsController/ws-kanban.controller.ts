import {Socket} from 'ngx-socket-io';
import {HttpHelper} from '../../../../Model/Helper/http-helper/http-helper';
import {WebsocketManagerService} from '../websocket-manager.service';
import {WebsocketPacketActionEnum} from '../../../../DTO/WebsocketPacketDto/WebsocketPacketActionEnum';
import {KanbanItem} from '../../../../Model/Whiteboard/ProjectSupporter/Kanban/KanbanItem/kanban-item';
import {WebsocketPacketDto} from '../../../../DTO/WebsocketPacketDto/WebsocketPacketDto';
import {KanbanEvent, KanbanEventEnum} from '../../../../Model/Whiteboard/ProjectSupporter/Kanban/KanbanEvent/KanbanEvent';
import {KanbanGroupEnum, KanbanItemDto} from '../../../../DTO/ProjectDto/KanbanDataDto/KanbanGroupDto/KanbanItemDto/kanban-item-dto';
import {WebsocketEvent, WebsocketEventEnum} from '../WebsocketEvent/WebsocketEvent';
import {KanbanDataDto} from '../../../../DTO/ProjectDto/KanbanDataDto/kanban-data-dto';

export class WsKanbanController {
  private socket:Socket;
  private websocketManager:WebsocketManagerService;
  private static instance:WsKanbanController;

  private constructor(websocketManager){
    console.warn("WsProjectController >> constructor >> 진입함");
    this.websocketManager = websocketManager;
    this.socket = this.websocketManager.socket;
    this.onKanbanCreated();
    this.onKanbanDeleted();
    this.onKanbanGet();
    this.onKanbanLock();
    this.onKanbanUnlock();
    this.onKanbanRelocation();
  }


  /* *************************************************** */
  /* Request Create kanban START */
  /* *************************************************** */
  requestCreateKanban(kanbanItem:KanbanItem, kanbanGroup){
    let kanbanItemDto = kanbanItem.exportDto(kanbanGroup.title);
    let packetDto = this.websocketManager.createProjectScopePacket(kanbanItemDto, WebsocketPacketActionEnum.CREATE);
    packetDto.wsPacketSeq = this.websocketManager.wsPacketSeq;
    this.socket.emit(HttpHelper.websocketApi.kanban.create.event, packetDto);
    this.websocketManager.saveNotVerifiedKanbanItem(packetDto, kanbanItem);
  }

  private onKanbanCreated(){
    this.socket.on(HttpHelper.websocketApi.kanban.create.event,
      (wsPacketDto:WebsocketPacketDto)=>{
        console.log("WsKanbanController >> onKanbanCreated >> wsPacketDto : ",wsPacketDto);
        switch (wsPacketDto.action) {
          case WebsocketPacketActionEnum.CREATE:
            this.createFromWsManager(wsPacketDto);
            this.websocketManager.kanbanEventManagerService.kanbanEventEmitter.emit(
              new KanbanEvent(KanbanEventEnum.CREATE, wsPacketDto.dataDto as KanbanItemDto));
            break;
          case WebsocketPacketActionEnum.ACK:
            this.websocketManager.verifyKanbanItem(wsPacketDto);
            break;
          case WebsocketPacketActionEnum.NAK:
            break;

        }
      })
  }

  createFromWsManager(wsPacketDto){
    let kanbanItemDto:KanbanItemDto = wsPacketDto.dataDto as KanbanItemDto;
    let groupEnum:KanbanGroupEnum = kanbanItemDto.parentGroup as KanbanGroupEnum;

    let currKanbanData = this.websocketManager.currentProjectDto.kanbanData;
    let targetGroup:Array<any> = null;

    switch (groupEnum) {
      case KanbanGroupEnum.TODO:
        targetGroup = currKanbanData.todoGroup;
        break;
      case KanbanGroupEnum.IN_PROGRESS:
        targetGroup = currKanbanData.inProgressGroup;
        break;
      case KanbanGroupEnum.DONE:
        targetGroup = currKanbanData.doneGroup;
        break;
      default :
        return;
    }
    targetGroup.push(kanbanItemDto);
  }
  /* **************************************************** */
  /* Request Create kanban END */
  /* **************************************************** */

  /* *************************************************** */
  /* Request Delete START */
  /* *************************************************** */

  requestDeleteKanban(kanbanItem:KanbanItem, kanbanGroup){
    let kanbanItemDto = kanbanItem.exportDto(kanbanGroup.title);
    let packetDto = this.websocketManager.createProjectScopePacket(kanbanItemDto, WebsocketPacketActionEnum.DELETE);
    packetDto.wsPacketSeq = this.websocketManager.wsPacketSeq;
    this.socket.emit(HttpHelper.websocketApi.kanban.delete.event, packetDto);
    this.websocketManager.saveNotVerifiedKanbanItem(packetDto, kanbanItem);
  }

  private onKanbanDeleted(){
    this.socket.on(HttpHelper.websocketApi.kanban.delete.event,
      (wsPacketDto:WebsocketPacketDto)=>{
        console.log("WsKanbanController >> onKanbanDeleted >> wsPacketDto : ",wsPacketDto);
        switch (wsPacketDto.action) {
          case WebsocketPacketActionEnum.DELETE:
            this.delFromWsManager(wsPacketDto);
            this.websocketManager.kanbanEventManagerService.kanbanEventEmitter.emit(
              new KanbanEvent(KanbanEventEnum.DELETE, wsPacketDto.dataDto as KanbanItemDto));
            break;
          case WebsocketPacketActionEnum.ACK:
            this.websocketManager.verifyKanbanItem(wsPacketDto);
            break;
          case WebsocketPacketActionEnum.NAK:
            break;

        }
      })
  }

  delFromWsManager(wsPacketDto){
    let kanbanItemDto:KanbanItemDto = wsPacketDto.dataDto as KanbanItemDto;
    let groupEnum:KanbanGroupEnum = kanbanItemDto.parentGroup as KanbanGroupEnum;

    let currKanbanData = this.websocketManager.currentProjectDto.kanbanData;
    let targetGroup:Array<any> = null;

    switch (groupEnum) {
      case KanbanGroupEnum.TODO:
        targetGroup = currKanbanData.todoGroup;
        break;
      case KanbanGroupEnum.IN_PROGRESS:
        targetGroup = currKanbanData.inProgressGroup;
        break;
      case KanbanGroupEnum.DONE:
        targetGroup = currKanbanData.doneGroup;
        break;
      default :
        return;
    }
    let index = -1;
    for(let i = 0 ; i < targetGroup.length; i++){
      let currItem = targetGroup[i];

      if(currItem._id === kanbanItemDto._id){
        index = i;
        break;
      }
    }

    if(index >= 0){
      targetGroup.splice(index, 1);
    }
  }

  /* **************************************************** */
  /* Request Delete END */
  /* **************************************************** */

  /* *************************************************** */
  /* Request Get START */
  /* *************************************************** */
  requestGetKanban(){
    let packetDto = this.websocketManager.createProjectScopePacket({}, WebsocketPacketActionEnum.READ);
    packetDto.wsPacketSeq = this.websocketManager.wsPacketSeq;
    this.socket.emit(HttpHelper.websocketApi.kanban.read.event, packetDto);
  }

  private onKanbanGet(){
    this.socket.on(HttpHelper.websocketApi.kanban.read.event,
      (wsPacketDto:WebsocketPacketDto)=>{
        console.log("WsKanbanController >> onKanbanGet >> wsPacketDto : ",wsPacketDto);
        switch (wsPacketDto.action) {
          case WebsocketPacketActionEnum.ACK:
            this.websocketManager.currentProjectDto.kanbanData = wsPacketDto.dataDto as KanbanDataDto;
            this.websocketManager.wsEventEmitter.emit(new WebsocketEvent(WebsocketEventEnum.GET_KANBAN_DATA,wsPacketDto.dataDto));
            break;
          case WebsocketPacketActionEnum.NAK:
            break;

        }
      })
  }
  /* **************************************************** */
  /* Request Get END */
  /* **************************************************** */

  /* *************************************************** */
  /* Request Relocation START */
  /* *************************************************** */
  requestRelocationKanban(fromKanbanItem:KanbanItem, fromKanbanGroupTitle, destGroupTitle, destIdx){
    let kanbanItemDto = fromKanbanItem.exportDto(fromKanbanGroupTitle);
    let packetDto = this.websocketManager.createProjectScopePacket(kanbanItemDto, WebsocketPacketActionEnum.RELOCATE);
    packetDto.wsPacketSeq = this.websocketManager.wsPacketSeq;

    packetDto.additionalData = {
      destGroupTitle  : destGroupTitle,
      destIdx         : destIdx
    };

    this.socket.emit(HttpHelper.websocketApi.kanban.relocate.event, packetDto);
    this.websocketManager.saveNotVerifiedKanbanItem(packetDto, fromKanbanItem);
  }

  private onKanbanRelocation(){
    this.socket.on(HttpHelper.websocketApi.kanban.relocate.event,
      (wsPacketDto:WebsocketPacketDto)=>{
        switch (wsPacketDto.action) {
          case WebsocketPacketActionEnum.RELOCATE:
            this.websocketManager.kanbanEventManagerService.kanbanEventEmitter.emit(
              new KanbanEvent(KanbanEventEnum.RELOCATE, wsPacketDto.dataDto as KanbanItemDto, wsPacketDto.additionalData));
            this.relocateFromWsManager(wsPacketDto);
            break;
          case WebsocketPacketActionEnum.ACK:
            this.websocketManager.verifyKanbanItem(wsPacketDto);
            break;
          case WebsocketPacketActionEnum.NAK:
            break;

        }
      })
  }

  relocateFromWsManager(wsPacketDto:WebsocketPacketDto){
    console.log("WsKanbanController >> relocateFromWsManager >> 진입함");
    let kanbanItemDto:KanbanItemDto = wsPacketDto.dataDto as KanbanItemDto;

    let destGroupTitle = wsPacketDto.additionalData.destGroupTitle;
    let destIdx = wsPacketDto.additionalData.destIdx;

    let kanbanDataDto = this.websocketManager.currentProjectDto.kanbanData;

    let fromGroup, toGroup;
    fromGroup = this.getGroupObject(kanbanDataDto, kanbanItemDto.parentGroup);
    toGroup = this.getGroupObject(kanbanDataDto, destGroupTitle);
    let adjustedIdx = -1;
    if(toGroup.length <= destIdx){//재배치될 위치가 그룹 배열크기를 초과하는 경우 enqueue함
      adjustedIdx = toGroup.length;
    }else{
      adjustedIdx = destIdx;
    }
    //1. 재배치할 위치로 칸반아이템을 삽입.
    kanbanItemDto.parentGroup = destGroupTitle;
    toGroup.splice(adjustedIdx, 0, kanbanItemDto);

    //2. 이전 위치에 있던 칸반 아이템을 제거
    let delIdx = -1;
    for(let i = 0 ; i < fromGroup.length; i++){
      let currItem = fromGroup[i];
      if(currItem._id === kanbanItemDto._id){
        delIdx = i;
        break;
      }
    }
    if(delIdx > -1){
      fromGroup.splice(delIdx, 1);
    }
    let testResult = this.websocketManager.currentProjectDto.kanbanData;
    console.log("WsKanbanController >> relocateFromWsManager >> testResult : ",testResult);
  }
  /* **************************************************** */
  /* Request Relocation END */
  /* **************************************************** */

  /* *************************************************** */
  /* Request LOCK START */
  /* *************************************************** */
  requestLockKanban(kanbanItem:KanbanItem, kanbanGroup){
    let kanbanItemDto = kanbanItem.exportDto(kanbanGroup.title);

    kanbanItemDto.lockedBy = this.websocketManager.userInfo.idToken;

    let packetDto = this.websocketManager.createProjectScopePacket(kanbanItemDto, WebsocketPacketActionEnum.LOCK);
    packetDto.wsPacketSeq = this.websocketManager.wsPacketSeq;
    this.socket.emit(HttpHelper.websocketApi.kanban.lock.event, packetDto);
    this.websocketManager.saveNotVerifiedKanbanItem(packetDto, kanbanItem);
  }

  private onKanbanLock(){
    this.socket.on(HttpHelper.websocketApi.kanban.lock.event,
      (wsPacketDto:WebsocketPacketDto)=>{
        console.log("WsKanbanController >> onKanbanLock >> wsPacketDto : ",wsPacketDto);
        switch (wsPacketDto.action) {
          case WebsocketPacketActionEnum.LOCK:
            this.lockFromWsManager(wsPacketDto);
            this.websocketManager.kanbanEventManagerService.kanbanEventEmitter.emit(
              new KanbanEvent(KanbanEventEnum.LOCK, wsPacketDto.dataDto as KanbanItemDto));
            break;
          case WebsocketPacketActionEnum.ACK:
            this.websocketManager.verifyKanbanItem(wsPacketDto);
            break;
          case WebsocketPacketActionEnum.NAK:
            break;

        }
      })
  }

  lockFromWsManager(wsPacketDto){
    let kanbanItemDto:KanbanItemDto = wsPacketDto.dataDto as KanbanItemDto;
    let groupEnum:KanbanGroupEnum = kanbanItemDto.parentGroup as KanbanGroupEnum;

    let currKanbanData = this.websocketManager.currentProjectDto.kanbanData;
    let targetGroup:Array<KanbanItemDto> = null;

    switch (groupEnum) {
      case KanbanGroupEnum.TODO:
        targetGroup = currKanbanData.todoGroup;
        break;
      case KanbanGroupEnum.IN_PROGRESS:
        targetGroup = currKanbanData.inProgressGroup;
        break;
      case KanbanGroupEnum.DONE:
        targetGroup = currKanbanData.doneGroup;
        break;
      default :
        return;
    }
    for(let i = 0 ; i < targetGroup.length; i++){
      let currItem = targetGroup[i];

      if(currItem._id === kanbanItemDto._id){
        currItem.lockedBy = kanbanItemDto.lockedBy;
        break;
      }
    }
  }
  /* **************************************************** */
  /* Request LOCK END */
  /* **************************************************** */

  /* *************************************************** */
  /* Request Unlock START */
  /* *************************************************** */

  requestUnlockKanban(kanbanItem:KanbanItem, kanbanGroup){
    let kanbanItemDto = kanbanItem.exportDto(kanbanGroup.title);

    kanbanItemDto.lockedBy = null;

    let packetDto = this.websocketManager.createProjectScopePacket(kanbanItemDto, WebsocketPacketActionEnum.UNLOCK);
    packetDto.wsPacketSeq = this.websocketManager.wsPacketSeq;
    this.socket.emit(HttpHelper.websocketApi.kanban.unlock.event, packetDto);
    this.websocketManager.saveNotVerifiedKanbanItem(packetDto, kanbanItem);
  }

  private onKanbanUnlock(){
    this.socket.on(HttpHelper.websocketApi.kanban.unlock.event,
      (wsPacketDto:WebsocketPacketDto)=>{
        console.log("WsKanbanController >> onKanbanUnlock >> wsPacketDto : ",wsPacketDto);
        switch (wsPacketDto.action) {
          case WebsocketPacketActionEnum.UNLOCK:
            this.unlockFromWsManager(wsPacketDto);
            this.websocketManager.kanbanEventManagerService.kanbanEventEmitter.emit(
              new KanbanEvent(KanbanEventEnum.UNLOCK, wsPacketDto.dataDto as KanbanItemDto));
            break;
          case WebsocketPacketActionEnum.ACK:
            this.websocketManager.verifyKanbanItem(wsPacketDto);
            break;
          case WebsocketPacketActionEnum.NAK:
            break;

        }
      })
  }

  unlockFromWsManager(wsPacketDto){
    let kanbanItemDto:KanbanItemDto = wsPacketDto.dataDto as KanbanItemDto;
    let groupEnum:KanbanGroupEnum = kanbanItemDto.parentGroup as KanbanGroupEnum;

    let currKanbanData = this.websocketManager.currentProjectDto.kanbanData;
    let targetGroup:Array<KanbanItemDto> = null;

    switch (groupEnum) {
      case KanbanGroupEnum.TODO:
        targetGroup = currKanbanData.todoGroup;
        break;
      case KanbanGroupEnum.IN_PROGRESS:
        targetGroup = currKanbanData.inProgressGroup;
        break;
      case KanbanGroupEnum.DONE:
        targetGroup = currKanbanData.doneGroup;
        break;
      default :
        return;
    }
    for(let i = 0 ; i < targetGroup.length; i++){
      let currItem = targetGroup[i];

      if(currItem._id === kanbanItemDto._id){
        currItem.lockedBy = kanbanItemDto.lockedBy;
        break;
      }
    }
  }

  /* **************************************************** */
  /* Request Unlock END */
  /* **************************************************** */




  public static initInstance(websocketManager){
    WsKanbanController.instance = new WsKanbanController(websocketManager);
  }

  public static getInstance(){
    if(WsKanbanController.instance){
      return WsKanbanController.instance;
    }
    else{
      console.warn("경고! 싱글톤 클래스를 초기화 하지 않은 채로 인스턴스에 접근하려는 시도 식별됨!!!");
      return null;
    }
  }

  getGroupObject(kanbanDataDto:KanbanDataDto, groupTitle){
    let switchEnum:KanbanGroupEnum = groupTitle as KanbanGroupEnum;
    switch (switchEnum) {
      case KanbanGroupEnum.TODO:
        return kanbanDataDto.todoGroup;
      case KanbanGroupEnum.IN_PROGRESS:
        return kanbanDataDto.inProgressGroup;
      case KanbanGroupEnum.DONE:
        return kanbanDataDto.doneGroup;
    }
  }


}
