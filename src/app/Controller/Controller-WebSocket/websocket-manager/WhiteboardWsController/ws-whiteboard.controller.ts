import {Socket} from 'ngx-socket-io';
import {HttpHelper} from '../../../../Model/Helper/http-helper/http-helper';
import {WebsocketManagerService} from '../websocket-manager.service';
import {WebsocketPacketActionEnum} from '../../../../DTO/WebsocketPacketDto/WebsocketPacketActionEnum';
import {WebsocketPacketDto} from '../../../../DTO/WebsocketPacketDto/WebsocketPacketDto';

import {Observable} from 'rxjs';
import {WbItemEvent, WbItemEventEnum} from './wb-item-event/wb-item-event';
import {WhiteboardItemDto} from '../../../../DTO/WhiteboardItemDto/whiteboard-item-dto';
import {WhiteboardItem} from '../../../../Model/Whiteboard/Whiteboard-Item/whiteboard-item';
import {ItemLifeCycleEnum} from '../../../../Model/Whiteboard/Whiteboard-Item/WhiteboardItemLifeCycle/WhiteboardItemLifeCycle';

export class WsWhiteboardController {
  private socket:Socket;
  private websocketManager:WebsocketManagerService;
  private static instance:WsWhiteboardController;

  private constructor(websocketManager){
    console.warn("WsProjectController >> constructor >> 진입함");
    this.websocketManager = websocketManager;
    this.socket = this.websocketManager.socket;
    this.onWbItemCreated();
    this.onWbItemDeleted();
    this.onWbItemUpdated();
    this.onWbItemLocked();
    this.onWbItemUnlocked();
    this.onMultipleWbItemCreated();
  }


  /* *************************************************** */
  /* Request Create START */
  /* *************************************************** */
  waitRequestCreateWbItem( wbItemDto:WhiteboardItemDto ){

    //this.websocketManager.uiService.spin$.next(true);

    return new Observable<any>((subscriber)=>{

      let packetDto = this.websocketManager.createWbSessionScopePacket(wbItemDto,WebsocketPacketActionEnum.CREATE);
      packetDto.wsPacketSeq = this.websocketManager.wsPacketSeq;

      this.socket.emit(HttpHelper.websocketApi.whiteboardItem.create.event, packetDto);

      //#### 요청 완료

      this.socket.once(HttpHelper.websocketApi.whiteboardItem.create.event,
        (wsPacketDto:WebsocketPacketDto)=>{
          //this.websocketManager.uiService.spin$.next(false);
          switch (wsPacketDto.action) {
            case WebsocketPacketActionEnum.ACK:
              console.log("WsWhiteboardController >> waitRequestCreateWbItem >> wsPacketDto : ",wsPacketDto);
              subscriber.next(wsPacketDto);
              break;
            case WebsocketPacketActionEnum.NAK:
              subscriber.error(wsPacketDto);
              break;
          }
        })
    });
  }

  private onWbItemCreated(){
    this.socket.on(HttpHelper.websocketApi.whiteboardItem.create.event,
      (wsPacketDto:WebsocketPacketDto)=>{
        if (wsPacketDto.action === WebsocketPacketActionEnum.CREATE) {
          console.log("WsWhiteboardController >> onWbItemCreated >> wsPacketDto : ",wsPacketDto);

          this.websocketManager.wbItemEventManagerService.wsWbItemEventEmitter.emit(
            new WbItemEvent( WbItemEventEnum.CREATE, wsPacketDto.dataDto as WhiteboardItemDto)
          );

        }
      });
  }
  /* **************************************************** */
  /* Request Create Multiple WbItem END */
  /* **************************************************** */

  /* *************************************************** */
  /* Request Create START */
  /* *************************************************** */
  waitRequestCreateMultipleWbItem( wbItemDtos:Array<WhiteboardItemDto> ){

    //this.websocketManager.uiService.spin$.next(true);

    return new Observable<any>((subscriber)=>{

      let packetDto = this.websocketManager.createWbSessionScopePacket(wbItemDtos,WebsocketPacketActionEnum.CREATE_MULTIPLE);
      packetDto.wsPacketSeq = this.websocketManager.wsPacketSeq;

      this.socket.emit(HttpHelper.websocketApi.whiteboardItem.create_multiple.event, packetDto);

      //#### 요청 완료

      this.socket.once(HttpHelper.websocketApi.whiteboardItem.create_multiple.event,
        (wsPacketDto:WebsocketPacketDto)=>{
          //this.websocketManager.uiService.spin$.next(false);
          switch (wsPacketDto.action) {
            case WebsocketPacketActionEnum.ACK:
              console.log("WsWhiteboardController >> waitRequestCreateWbItem >> wsPacketDto : ",wsPacketDto);
              subscriber.next(wsPacketDto);
              break;
            case WebsocketPacketActionEnum.NAK:
              subscriber.error(wsPacketDto);
              break;
          }
        })
    });
  }

  private onMultipleWbItemCreated(){
    this.socket.on(HttpHelper.websocketApi.whiteboardItem.create_multiple.event,
      (wsPacketDto:WebsocketPacketDto)=>{
        if (wsPacketDto.action === WebsocketPacketActionEnum.CREATE_MULTIPLE) {
          console.log("WsWhiteboardController >> onWbItemCreated >> wsPacketDto : ",wsPacketDto);

          this.websocketManager.wbItemEventManagerService.wsWbItemEventEmitter.emit(
            new WbItemEvent( WbItemEventEnum.CREATE_MULTIPLE, null, wsPacketDto.dataDto)
          );

        }
      });
  }
  /* **************************************************** */
  /* Request Create Multiple WbItem END */
  /* **************************************************** */

  /* *************************************************** */
  /* Request Update START */
  /* *************************************************** */
  waitRequestUpdateWbItem( wbItem:WhiteboardItem, updateEvent:ItemLifeCycleEnum ){
    //this.websocketManager.uiService.spin$.next(true);
    return new Observable<any>((subscriber)=>{
      let wbItemDto = wbItem.exportToDto();

      let packetDto = this.websocketManager.createWbSessionScopePacket(wbItemDto,WebsocketPacketActionEnum.UPDATE);
      packetDto.wsPacketSeq = this.websocketManager.wsPacketSeq;
      packetDto.additionalData = updateEvent;

      this.socket.emit(HttpHelper.websocketApi.whiteboardItem.update.event, packetDto);

      //#### 요청 완료

      this.socket.once(HttpHelper.websocketApi.whiteboardItem.update.event,
        (wsPacketDto:WebsocketPacketDto)=>{
          //this.websocketManager.uiService.spin$.next(false);
          switch (wsPacketDto.action) {
            case WebsocketPacketActionEnum.ACK:
              console.log("WsWhiteboardController >> waitRequestUpdateWbItem >> wsPacketDto : ",wsPacketDto);
              subscriber.next(wsPacketDto);
              break;
            case WebsocketPacketActionEnum.NAK:
              subscriber.error(wsPacketDto);
              break;
          }
        })
    });
  }

  private onWbItemUpdated(){
    this.socket.on(HttpHelper.websocketApi.whiteboardItem.update.event,
      (wsPacketDto:WebsocketPacketDto)=>{
        if (wsPacketDto.action === WebsocketPacketActionEnum.UPDATE) {
          console.log("WsWhiteboardController >> onWbItemUpdated >> wsPacketDto : ",wsPacketDto);

          this.websocketManager.wbItemEventManagerService.wsWbItemEventEmitter.emit(
            new WbItemEvent(
              WbItemEventEnum.UPDATE,
              wsPacketDto.dataDto as WhiteboardItemDto,
              wsPacketDto.additionalData as ItemLifeCycleEnum)
          );

        }
      });
  }
  /* **************************************************** */
  /* Request Update END */
  /* **************************************************** */

  /* *************************************************** */
  /* Request Delete START */
  /* *************************************************** */
  waitRequestDeleteWbItem( wbItemDto:WhiteboardItemDto ){

    //this.websocketManager.uiService.spin$.next(true);

    return new Observable<any>((subscriber)=>{

      let packetDto = this.websocketManager.createWbSessionScopePacket(wbItemDto,WebsocketPacketActionEnum.DELETE);
      packetDto.wsPacketSeq = this.websocketManager.wsPacketSeq;

      this.socket.emit(HttpHelper.websocketApi.whiteboardItem.delete.event, packetDto);

      //#### 요청 완료

      this.socket.once(HttpHelper.websocketApi.whiteboardItem.delete.event,
        (wsPacketDto:WebsocketPacketDto)=>{
          //this.websocketManager.uiService.spin$.next(false);
          switch (wsPacketDto.action) {
            case WebsocketPacketActionEnum.ACK:
              console.log("WsWhiteboardController >> waitRequestDeleteWbItem >> wsPacketDto : ",wsPacketDto);
              subscriber.next(wsPacketDto);
              break;
            case WebsocketPacketActionEnum.NAK:
              subscriber.error(wsPacketDto);
              break;
          }
        })
    });
  }

  private onWbItemDeleted(){
    this.socket.on(HttpHelper.websocketApi.whiteboardItem.delete.event,
      (wsPacketDto:WebsocketPacketDto)=>{
        if (wsPacketDto.action === WebsocketPacketActionEnum.DELETE) {
          console.log("WsWhiteboardController >> onWbItemDeleted >> wsPacketDto : ",wsPacketDto);

          this.websocketManager.wbItemEventManagerService.wsWbItemEventEmitter.emit(
            new WbItemEvent( WbItemEventEnum.DELETE, wsPacketDto.dataDto as WhiteboardItemDto)
          );

        }
      });
  }
  /* **************************************************** */
  /* Request Delete END */
  /* **************************************************** */

  /* *************************************************** */
  /* Request Get START */
  /* *************************************************** */
  waitRequestGetWbItem(  ){

    //this.websocketManager.uiService.spin$.next(true);

    return new Observable<any>((subscriber)=>{

      let packetDto = this.websocketManager.createWbSessionScopePacket({},WebsocketPacketActionEnum.READ);
      packetDto.wsPacketSeq = this.websocketManager.wsPacketSeq;

      this.socket.emit(HttpHelper.websocketApi.whiteboardItem.read.event, packetDto);

      //#### 요청 완료

      this.socket.once(HttpHelper.websocketApi.whiteboardItem.read.event,
        (wsPacketDto:WebsocketPacketDto)=>{
          //this.websocketManager.uiService.spin$.next(false);
          switch (wsPacketDto.action) {
            case WebsocketPacketActionEnum.ACK:
              console.log("WsWhiteboardController >> waitRequestGetWbItem >> wsPacketDto : ",wsPacketDto);
              subscriber.next(wsPacketDto);
              break;
            case WebsocketPacketActionEnum.NAK:
              subscriber.error(wsPacketDto);
              break;
          }
        })
    });
  }
  /* **************************************************** */
  /* Request Get END */
  /* **************************************************** */

  /* *************************************************** */
  /* Request Lock START */
  /* *************************************************** */
  waitRequestLockWbItem( wbItemDto:WhiteboardItemDto ){

    //this.websocketManager.uiService.spin$.next(true);

    return new Observable<any>((subscriber)=>{

      let packetDto = this.websocketManager.createWbSessionScopePacket(wbItemDto,WebsocketPacketActionEnum.LOCK);
      packetDto.wsPacketSeq = this.websocketManager.wsPacketSeq;

      this.socket.emit(HttpHelper.websocketApi.whiteboardItem.lock.event, packetDto);

      //#### 요청 완료

      this.socket.once(HttpHelper.websocketApi.whiteboardItem.lock.event,
        (wsPacketDto:WebsocketPacketDto)=>{
          //this.websocketManager.uiService.spin$.next(false);
          switch (wsPacketDto.action) {
            case WebsocketPacketActionEnum.ACK:
              console.log("WsWhiteboardController >> waitRequestLockWbItem >> wsPacketDto : ",wsPacketDto);
              subscriber.next(wsPacketDto);
              break;
            case WebsocketPacketActionEnum.NAK:
              subscriber.error(wsPacketDto);
              break;
          }
        })
    });
  }

  private onWbItemLocked(){
    this.socket.on(HttpHelper.websocketApi.whiteboardItem.lock.event,
      (wsPacketDto:WebsocketPacketDto)=>{
        if (wsPacketDto.action === WebsocketPacketActionEnum.LOCK) {
          console.log("WsWhiteboardController >> onWbItemLocked >> wsPacketDto : ",wsPacketDto);

          this.websocketManager.wbItemEventManagerService.wsWbItemEventEmitter.emit(
            new WbItemEvent( WbItemEventEnum.UPDATE, wsPacketDto.dataDto as WhiteboardItemDto)
          );

        }
      });
  }
  /* **************************************************** */
  /* Request Lock END */
  /* **************************************************** */

  /* *************************************************** */
  /* Request Unlock START */
  /* *************************************************** */
  waitRequestUnlockWbItem( wbItemDto:WhiteboardItemDto ){

    //this.websocketManager.uiService.spin$.next(true);

    return new Observable<any>((subscriber)=>{

      let packetDto = this.websocketManager.createWbSessionScopePacket(wbItemDto,WebsocketPacketActionEnum.UNLOCK);
      packetDto.wsPacketSeq = this.websocketManager.wsPacketSeq;

      this.socket.emit(HttpHelper.websocketApi.whiteboardItem.unlock.event, packetDto);

      //#### 요청 완료

      this.socket.once(HttpHelper.websocketApi.whiteboardItem.unlock.event,
        (wsPacketDto:WebsocketPacketDto)=>{
          //this.websocketManager.uiService.spin$.next(false);
          switch (wsPacketDto.action) {
            case WebsocketPacketActionEnum.ACK:
              console.log("WsWhiteboardController >> waitRequestUnlockWbItem >> wsPacketDto : ",wsPacketDto);
              subscriber.next(wsPacketDto);
              break;
            case WebsocketPacketActionEnum.NAK:
              subscriber.error(wsPacketDto);
              break;
          }
        })
    });
  }

  private onWbItemUnlocked(){
    this.socket.on(HttpHelper.websocketApi.whiteboardItem.unlock.event,
      (wsPacketDto:WebsocketPacketDto)=>{
        if (wsPacketDto.action === WebsocketPacketActionEnum.UNLOCK) {
          console.log("WsWhiteboardController >> onWbItemUnlocked >> wsPacketDto : ",wsPacketDto);

          this.websocketManager.wbItemEventManagerService.wsWbItemEventEmitter.emit(
            new WbItemEvent( WbItemEventEnum.UPDATE, wsPacketDto.dataDto as WhiteboardItemDto)
          );

        }
      });
  }
  /* **************************************************** */
  /* Request Unlock END */
  /* **************************************************** */


  public static initInstance(websocketManager){
    WsWhiteboardController.instance = new WsWhiteboardController(websocketManager);
  }

  public static getInstance(){
    if(WsWhiteboardController.instance){
      return WsWhiteboardController.instance;
    }
    else{
      console.warn("경고! 싱글톤 클래스를 초기화 하지 않은 채로 인스턴스에 접근하려는 시도 식별됨!!!");
      return null;
    }
  }

}
