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
import {KanbanGroup} from '../../../../Model/Whiteboard/ProjectSupporter/Kanban/KanbanGroup/kanban-group';
import {moveItemInArray, transferArrayItem} from '@angular/cdk/drag-drop';
import {Observable, Subscription} from 'rxjs';
import {TagItem} from '../../../../Model/Whiteboard/ProjectSupporter/Kanban/KanbanTagListManager/kanban-tag-list-manager.service';
import {KanbanTagDto} from '../../../../DTO/ProjectDto/KanbanDataDto/KanbanTagDto/kanban-tag-dto';

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
    /*this.onKanbanGet();*/
    this.onKanbanLock();
    this.onKanbanUnlock();
    this.onKanbanRelocation();
    this.onKanbanUpdate();
    this.onKanbanTagCreate();
    this.onKanbanTagDelete();
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
        //console.log("WsKanbanController >> onKanbanCreated >> wsPacketDto : ",wsPacketDto);
        switch (wsPacketDto.action) {
          case WebsocketPacketActionEnum.CREATE:
            // this.createFromWsManager(wsPacketDto);
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
        //console.log("WsKanbanController >> onKanbanDeleted >> wsPacketDto : ",wsPacketDto);
        switch (wsPacketDto.action) {
          case WebsocketPacketActionEnum.DELETE:
            // this.delFromWsManager(wsPacketDto);
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

  /* **************************************************** */
  /* Request Delete END */
  /* **************************************************** */

  /* *************************************************** */
  /* Request Get START */
  /* *************************************************** */
  requestGetKanban() :Observable<any>{
    this.websocketManager.uiService.spin$.next(true);
    return new Observable<any>((subscriber)=>{
      let packetDto = this.websocketManager.createProjectScopePacket({}, WebsocketPacketActionEnum.READ);
      packetDto.wsPacketSeq = this.websocketManager.wsPacketSeq;

      this.socket.emit(HttpHelper.websocketApi.kanban.read.event, packetDto);

      this.socket.on(HttpHelper.websocketApi.kanban.read.event,
        (wsPacketDto:WebsocketPacketDto)=>{
          this.websocketManager.uiService.spin$.next(false);
          //console.log("WsKanbanController >> onKanbanGet >> wsPacketDto : ",wsPacketDto);
          switch (wsPacketDto.action) {
            case WebsocketPacketActionEnum.ACK:
              subscriber.next(wsPacketDto.dataDto);
              break;
            case WebsocketPacketActionEnum.NAK:
              break;

          }
        })
    });
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

    //console.log("WsKanbanController >> requestRelocationKanban >> packetDto : ",packetDto);

    this.socket.emit(HttpHelper.websocketApi.kanban.relocate.event, packetDto);
    this.websocketManager.saveNotVerifiedKanbanItem(packetDto, fromKanbanItem);
  }

  private onKanbanRelocation(){
    this.socket.on(HttpHelper.websocketApi.kanban.relocate.event,
      (wsPacketDto:WebsocketPacketDto)=>{
        //console.log("WsKanbanController >> onKanbanRelocation >> 진입함");
        switch (wsPacketDto.action) {
          case WebsocketPacketActionEnum.RELOCATE:
            this.websocketManager.kanbanEventManagerService.kanbanEventEmitter.emit(
              new KanbanEvent(KanbanEventEnum.RELOCATE, wsPacketDto.dataDto as KanbanItemDto, wsPacketDto.additionalData));
            // this.relocateFromWsManager(wsPacketDto);
            break;
          case WebsocketPacketActionEnum.ACK:
            this.websocketManager.verifyKanbanItem(wsPacketDto);
            break;
          case WebsocketPacketActionEnum.NAK:
            break;

        }
      })
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

  waitRequestLockKanban(kanbanItem:KanbanItem, kanbanGroup):Observable<any>{

    this.websocketManager.uiService.spin$.next(true);

    return new Observable<any>((subscriber)=>{
      //console.log("WsKanbanController >> waitRequestLockKanban >> 진입함");
      let kanbanItemDto = kanbanItem.exportDto(kanbanGroup.title);

      kanbanItemDto.lockedBy = this.websocketManager.userInfo.idToken;

      let packetDto = this.websocketManager.createProjectScopePacket(kanbanItemDto, WebsocketPacketActionEnum.LOCK);
      packetDto.wsPacketSeq = this.websocketManager.wsPacketSeq;
      this.socket.emit(HttpHelper.websocketApi.kanban.lock.event, packetDto);
      this.websocketManager.saveNotVerifiedKanbanItem(packetDto, kanbanItem);

      // #### Request Sequence End Start Subscribe Sequence

      this.socket.once(HttpHelper.websocketApi.kanban.lock.event,
        (wsPacketDto:WebsocketPacketDto)=>{
          this.websocketManager.uiService.spin$.next(false);
          switch (wsPacketDto.action) {
            case WebsocketPacketActionEnum.ACK:
              //console.log("WsKanbanController >> onKanbanLock >> wsPacketDto : ",wsPacketDto);
              this.websocketManager.verifyKanbanItem(wsPacketDto);
              subscriber.next(wsPacketDto);
              break;
            case WebsocketPacketActionEnum.NAK:
              subscriber.error(wsPacketDto);
              break;
          }
        });
    });
  }

  private onKanbanLock(){
    this.socket.on(HttpHelper.websocketApi.kanban.lock.event,
      (wsPacketDto:WebsocketPacketDto)=>{
        switch (wsPacketDto.action) {
          case WebsocketPacketActionEnum.LOCK:
            //console.log("WsKanbanController >> onKanbanLock >> wsPacketDto : ",wsPacketDto);
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
        //console.log("WsKanbanController >> onKanbanUnlock >> wsPacketDto : ",wsPacketDto);
        switch (wsPacketDto.action) {
          case WebsocketPacketActionEnum.UNLOCK:
            // this.unlockFromWsManager(wsPacketDto);
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

  /* **************************************************** */
  /* Request Unlock END */
  /* **************************************************** */

  /* *************************************************** */
  /* Request Edit START */
  /* *************************************************** */

  requestUpdateKanban(kanbanItem:KanbanItem, kanbanGroup){
    let kanbanItemDto = kanbanItem.exportDto(kanbanGroup.title);
    let packetDto = this.websocketManager.createProjectScopePacket(kanbanItemDto, WebsocketPacketActionEnum.UPDATE);
    packetDto.wsPacketSeq = this.websocketManager.wsPacketSeq;
    this.socket.emit(HttpHelper.websocketApi.kanban.update.event, packetDto);
    this.websocketManager.saveNotVerifiedKanbanItem(packetDto, kanbanItem);
  }
  waitRequestUpdateKanban(kanbanItem:KanbanItem, kanbanGroup){

    this.websocketManager.uiService.spin$.next(true);

    return new Observable<any>((subscriber)=>{
      let kanbanItemDto = kanbanItem.exportDto(kanbanGroup.title);
      let packetDto = this.websocketManager.createProjectScopePacket(kanbanItemDto, WebsocketPacketActionEnum.UPDATE);
      packetDto.wsPacketSeq = this.websocketManager.wsPacketSeq;
      this.socket.emit(HttpHelper.websocketApi.kanban.update.event, packetDto);
      this.websocketManager.saveNotVerifiedKanbanItem(packetDto, kanbanItem);

      //#### 요청 완료

      this.socket.once(HttpHelper.websocketApi.kanban.update.event,
        (wsPacketDto:WebsocketPacketDto)=>{
          this.websocketManager.uiService.spin$.next(false);
          switch (wsPacketDto.action) {
            case WebsocketPacketActionEnum.ACK:
              //console.log("WsKanbanController >> onKanbanUpdate >> wsPacketDto : ",wsPacketDto);
              this.websocketManager.verifyKanbanItem(wsPacketDto);
              subscriber.next(packetDto);
              break;
            case WebsocketPacketActionEnum.NAK:
              subscriber.error(packetDto);
              break;
          }
        })
    });
  }

  private onKanbanUpdate(){
    this.socket.on(HttpHelper.websocketApi.kanban.update.event,
      (wsPacketDto:WebsocketPacketDto)=>{
        switch (wsPacketDto.action) {
          case WebsocketPacketActionEnum.UPDATE:
            //console.log("WsKanbanController >> onKanbanUpdate >> wsPacketDto : ",wsPacketDto);
            this.websocketManager.kanbanEventManagerService.kanbanEventEmitter.emit(
              new KanbanEvent(KanbanEventEnum.UPDATE, wsPacketDto.dataDto as KanbanItemDto));
            break;
          case WebsocketPacketActionEnum.ACK:
            this.websocketManager.verifyKanbanItem(wsPacketDto);
            break;
          case WebsocketPacketActionEnum.NAK:
            break;

        }
      })
  }

  /* **************************************************** */
  /* Request Edit END */
  /* **************************************************** */

  /* *************************************************** */
  /* Request Create TAG START */
  /* *************************************************** */

  waitRequestCreateKanbanTag(kanbanTag:TagItem){
    this.websocketManager.uiService.spin$.next(true);
    return new Observable<any>((subscriber)=>{
      let tagDto = kanbanTag.exportDto();
      //console.log("WsKanbanController >> waitRequestCreateKanbanTag >> tagDto : ",tagDto);

      let packetDto = this.websocketManager.createProjectScopePacket(tagDto, WebsocketPacketActionEnum.CREATE_TAG);
      packetDto.wsPacketSeq = this.websocketManager.wsPacketSeq;

      this.socket.emit(HttpHelper.websocketApi.kanban.create_tag.event, packetDto);

      //this.websocketManager.saveNotVerifiedKanbanItem(packetDto, kanbanItem);

      //#### 요청 완료

      this.socket.once(HttpHelper.websocketApi.kanban.create_tag.event,
        (wsPacketDto:WebsocketPacketDto)=>{
          this.websocketManager.uiService.spin$.next(false);
          switch (wsPacketDto.action) {
            case WebsocketPacketActionEnum.ACK:
              //console.log("WsKanbanController >> waitRequestCreateTagKanban >> wsPacketDto : ",wsPacketDto);
              let responseTagDto:KanbanTagDto = wsPacketDto.dataDto as KanbanTagDto;
              kanbanTag._id = responseTagDto._id;
              subscriber.next(responseTagDto);
              break;
            case WebsocketPacketActionEnum.NAK:
              subscriber.error(packetDto);
              break;
          }
        })
    });
  }

  private onKanbanTagCreate(){
    this.socket.on(HttpHelper.websocketApi.kanban.create_tag.event,
      (wsPacketDto:WebsocketPacketDto)=>{
        switch (wsPacketDto.action) {
          case WebsocketPacketActionEnum.CREATE_TAG:
            //console.log("WsKanbanController >> onKanbanCreateTag >> wsPacketDto : ",wsPacketDto);
            let responseTagDto:KanbanTagDto = wsPacketDto.dataDto as KanbanTagDto;
            this.websocketManager.kanbanEventManagerService.kanbanEventEmitter.emit(
              new KanbanEvent(KanbanEventEnum.CREATE_TAG, null, responseTagDto));
            break;
          case WebsocketPacketActionEnum.ACK:
            break;
          case WebsocketPacketActionEnum.NAK:
            break;
        }
      });
  }

  /* **************************************************** */
  /* Request Create TAG END */
  /* **************************************************** */

  /* *************************************************** */
  /* Request Delete TAG START */
  /* *************************************************** */
  waitRequestDeleteKanbanTag(kanbanTag:TagItem){
    this.websocketManager.uiService.spin$.next(true);
    return new Observable<any>((subscriber)=>{
      let tagDto = kanbanTag.exportDto();
      //console.log("WsKanbanController >> waitRequestDeleteKanbanTag >> tagDto : ",tagDto);

      let packetDto = this.websocketManager.createProjectScopePacket(tagDto, WebsocketPacketActionEnum.DELETE_TAG);
      packetDto.wsPacketSeq = this.websocketManager.wsPacketSeq;

      this.socket.emit(HttpHelper.websocketApi.kanban.delete_tag.event, packetDto);

      //this.websocketManager.saveNotVerifiedKanbanItem(packetDto, kanbanItem);

      //#### 요청 완료

      this.socket.once(HttpHelper.websocketApi.kanban.delete_tag.event,
        (wsPacketDto:WebsocketPacketDto)=>{
          this.websocketManager.uiService.spin$.next(false);
          switch (wsPacketDto.action) {
            case WebsocketPacketActionEnum.ACK:
              //console.log("WsKanbanController >> waitRequestDeleteKanbanTag >> wsPacketDto : ",wsPacketDto);
              let responseTagDto:KanbanTagDto = wsPacketDto.dataDto as KanbanTagDto;
              kanbanTag._id = responseTagDto._id;
              subscriber.next(responseTagDto);
              break;
            case WebsocketPacketActionEnum.NAK:
              subscriber.error(packetDto);
              break;
          }
        })
    });
  }

  private onKanbanTagDelete(){
    this.socket.on(HttpHelper.websocketApi.kanban.delete_tag.event,
      (wsPacketDto:WebsocketPacketDto)=>{
        switch (wsPacketDto.action) {
          case WebsocketPacketActionEnum.DELETE_TAG:
            //console.log("WsKanbanController >> onKanbanTagDelete >> wsPacketDto : ",wsPacketDto);
            let responseTagDto:KanbanTagDto = wsPacketDto.dataDto as KanbanTagDto;
            this.websocketManager.kanbanEventManagerService.kanbanEventEmitter.emit(
              new KanbanEvent(KanbanEventEnum.DELETE_TAG, null, responseTagDto));
            break;
          case WebsocketPacketActionEnum.ACK:
            break;
          case WebsocketPacketActionEnum.NAK:
            break;
        }
      });
  }
  /* **************************************************** */
  /* Request Delete TAG END */
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


}
