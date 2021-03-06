import {Socket} from 'ngx-socket-io';
import {HttpHelper} from '../../../../Model/Helper/http-helper/http-helper';
import {WebsocketManagerService} from '../websocket-manager.service';
import {WebsocketPacketActionEnum} from '../../../../DTO/WebsocketPacketDto/WebsocketPacketActionEnum';
import {WebsocketPacketDto} from '../../../../DTO/WebsocketPacketDto/WebsocketPacketDto';
import {KanbanItemDto} from '../../../../DTO/ProjectDto/KanbanDataDto/KanbanGroupDto/KanbanItemDto/kanban-item-dto';

import {Observable} from 'rxjs';
import {WhiteboardSessionDto} from '../../../../DTO/ProjectDto/WhiteboardSessionDto/whiteboard-session-dto';
import {WbSessionEvent, WbSessionEventEnum} from './wb-session-event/wb-session-event';
import {GachiPointDto} from '../../../../DTO/WhiteboardItemDto/PointDto/gachi-point-dto';

export class WsWhiteboardSessionController {
  private socket:Socket;
  private websocketManager:WebsocketManagerService;
  private static instance:WsWhiteboardSessionController;

  private constructor(websocketManager){
    console.warn("WsProjectController >> constructor >> 진입함");
    this.websocketManager = websocketManager;
    this.socket = this.websocketManager.socket;
    this.onWbSessionCreated();
    this.onWbSessionUpdate();
    this.onWbSessionJoined();
    this.onWbSessionDelete();
    this.onCursorDataUpdate();
    this.onWbSessionDisconnected();
  }


  /* *************************************************** */
  /* Request Create START */
  /* *************************************************** */

  waitRequestCreateWbSession( wbSessionDto:WhiteboardSessionDto ){

    // this.websocketManager.uiService.spin$.next(true);

    return new Observable<any>((subscriber)=>{

      let packetDto = this.websocketManager.createProjectScopePacket(wbSessionDto, WebsocketPacketActionEnum.CREATE);
      packetDto.wsPacketSeq = this.websocketManager.wsPacketSeq;

      this.socket.emit(HttpHelper.websocketApi.whiteboardSession.create.event, packetDto);

      //#### 요청 완료

      this.socket.once(HttpHelper.websocketApi.whiteboardSession.create.event + HttpHelper.ACK_SIGN,
        (wsPacketDto:WebsocketPacketDto)=>{
          // this.websocketManager.uiService.spin$.next(false);
          switch (wsPacketDto.action) {
            case WebsocketPacketActionEnum.ACK:
              //console.log("WsWhiteboardSessionController >> waitRequestCreateWbSession >> wsPacketDto : ",wsPacketDto);
              subscriber.next(packetDto.dataDto);
              break;
            case WebsocketPacketActionEnum.NAK:
              subscriber.error(packetDto);
              break;
          }
        })
    });
  }

  private onWbSessionCreated(){
    this.socket.on(HttpHelper.websocketApi.whiteboardSession.create.event,
      (wsPacketDto:WebsocketPacketDto)=>{
        //console.log("WsWhiteboardSessionController >> onWbSessionCreated >> wsPacketDto : ",wsPacketDto);
        this.websocketManager.wbSessionEventManagerService.wsWbSessionEventEmitter.emit(
          new WbSessionEvent(WbSessionEventEnum.CREATE, wsPacketDto.dataDto as WhiteboardSessionDto));
      });
  }

  /* **************************************************** */
  /* Request Create END */
  /* **************************************************** */

  /* *************************************************** */
  /* Request JOIN START */
  /* *************************************************** */

  waitRequestJoinWbSession( wbSessionDto:WhiteboardSessionDto ){

    this.websocketManager.uiService.spin$.next(true);

    return new Observable<any>((subscriber)=>{

      let packetDto = this.websocketManager.createProjectScopePacket(wbSessionDto, WebsocketPacketActionEnum.JOIN);
      packetDto.wsPacketSeq = this.websocketManager.wsPacketSeq;

      this.socket.emit(HttpHelper.websocketApi.whiteboardSession.join.event, packetDto);

      //#### 요청 완료

      this.socket.once(HttpHelper.websocketApi.whiteboardSession.join.event + HttpHelper.ACK_SIGN,
        (wsPacketDto:WebsocketPacketDto)=>{
          this.websocketManager.uiService.spin$.next(false);
          switch (wsPacketDto.action) {
            case WebsocketPacketActionEnum.ACK:
              //console.log("WsWhiteboardSessionController >> waitRequestJoinWbSession >> wsPacketDto : ",wsPacketDto);
              this.websocketManager.currentWbSessionDto = wsPacketDto.dataDto as WhiteboardSessionDto;
              subscriber.next(this.websocketManager.currentWbSessionDto);
              break;
            case WebsocketPacketActionEnum.NAK:
              subscriber.error(packetDto);
              break;
          }
        })
    });
  }

  private onWbSessionJoined(){
    this.socket.on(HttpHelper.websocketApi.whiteboardSession.join.event,
      (wsPacketDto:WebsocketPacketDto)=>{
        if (wsPacketDto.action === WebsocketPacketActionEnum.JOIN) {
          //console.log("WsWhiteboardSessionController >> onWbSessionCreated >> wsPacketDto : ",wsPacketDto);
          this.websocketManager.wbSessionEventManagerService.wsWbSessionEventEmitter.emit(
            new WbSessionEvent(WbSessionEventEnum.JOIN, wsPacketDto.dataDto as WhiteboardSessionDto, wsPacketDto.additionalData));
        }
      });
  }

  /* **************************************************** */
  /* Request JOIN END */
  /* **************************************************** */

  /* *************************************************** */
  /* Request DISCONNECT START */
  /* *************************************************** */

  private onWbSessionDisconnected(){
    this.socket.on(HttpHelper.websocketApi.whiteboardSession.disconnect.event,
      (wsPacketDto:WebsocketPacketDto)=>{
        if (wsPacketDto.action === WebsocketPacketActionEnum.DISCONNECT) {
          //console.log("WsWhiteboardSessionController >> onWbSessionDisconnected >> wsPacketDto : ",wsPacketDto);
          this.websocketManager.wbSessionEventManagerService.wsWbSessionEventEmitter.emit(
            new WbSessionEvent(WbSessionEventEnum.DISCONNECT, wsPacketDto.dataDto as WhiteboardSessionDto, wsPacketDto.additionalData));
        }
      });
  }

  /* **************************************************** */
  /* Request DISCONNECT END */
  /* **************************************************** */

  /* *************************************************** */
  /* Request Get START */
  /* *************************************************** */
  requestGetWbSessionList() :Observable<any>{
    this.websocketManager.uiService.spin$.next(true);

    return new Observable<any>((subscriber)=>{

      let packetDto = this.websocketManager.createProjectScopePacket({}, WebsocketPacketActionEnum.READ);
      packetDto.wsPacketSeq = this.websocketManager.wsPacketSeq;

      this.socket.emit(HttpHelper.websocketApi.whiteboardSession.read.event, packetDto);

      //#### 요청 완료

      this.socket.once(HttpHelper.websocketApi.whiteboardSession.read.event + HttpHelper.ACK_SIGN,
        (wsPacketDto:WebsocketPacketDto)=>{
          this.websocketManager.uiService.spin$.next(false);
          switch (wsPacketDto.action) {
            case WebsocketPacketActionEnum.ACK:
              //console.log("WsWhiteboardSessionController >> waitRequestCreateWbSession >> wsPacketDto : ",wsPacketDto);
              let wbSessionList:Array<WhiteboardSessionDto> = wsPacketDto.dataDto as Array<WhiteboardSessionDto>;
              subscriber.next(wbSessionList);
              break;
            case WebsocketPacketActionEnum.NAK:
              subscriber.error(packetDto);
              break;
          }
        })
    });
  }

  /* **************************************************** */
  /* Request Get END */
  /* **************************************************** */

  /* *************************************************** */
  /* Update START */
  /* *************************************************** */

  waitRequestUpdateWbSession(wbSessionDto) :Observable<any>{
    // this.websocketManager.uiService.spin$.next(true);

    return new Observable<any>((subscriber)=>{

      let packetDto = this.websocketManager.createProjectScopePacket(wbSessionDto, WebsocketPacketActionEnum.UPDATE);
      packetDto.wsPacketSeq = this.websocketManager.wsPacketSeq;

      this.socket.emit(HttpHelper.websocketApi.whiteboardSession.update.event, packetDto);

      //#### 요청 완료

      this.socket.once(HttpHelper.websocketApi.whiteboardSession.update.event + HttpHelper.ACK_SIGN,
        (wsPacketDto:WebsocketPacketDto)=>{
          // this.websocketManager.uiService.spin$.next(false);
          switch (wsPacketDto.action) {
            case WebsocketPacketActionEnum.ACK:
              //console.log("WsWhiteboardSessionController >> waitRequestUpdateWbSession >> wsPacketDto : ",wsPacketDto);
              this.websocketManager.wbSessionEventManagerService.wsWbSessionEventEmitter.emit(
                new WbSessionEvent(WbSessionEventEnum.UPDATE, wsPacketDto.dataDto as WhiteboardSessionDto, wsPacketDto.additionalData));
              subscriber.next(packetDto.dataDto);
              break;
            case WebsocketPacketActionEnum.NAK:
              subscriber.error(packetDto);
              break;
          }
        })
    });
  }
  private onWbSessionUpdate(){
    this.socket.on(HttpHelper.websocketApi.whiteboardSession.update.event,
      (wsPacketDto:WebsocketPacketDto)=>{
        if (wsPacketDto.action === WebsocketPacketActionEnum.UPDATE) {
          //console.log("WsWhiteboardSessionController >> onPinged >> wsPacketDto : ",wsPacketDto);
          this.websocketManager.wbSessionEventManagerService.wsWbSessionEventEmitter.emit(
            new WbSessionEvent(WbSessionEventEnum.UPDATE, wsPacketDto.dataDto as WhiteboardSessionDto, wsPacketDto.additionalData));
        }
      });
  }

  /* **************************************************** */
  /* Update END */
  /* **************************************************** */

  /* *************************************************** */
  /* Delete START */
  /* *************************************************** */

  waitRequestDeleteWbSession(wbSessionDto) :Observable<any>{
    // this.websocketManager.uiService.spin$.next(true);

    return new Observable<any>((subscriber)=>{

      let packetDto = this.websocketManager.createProjectScopePacket(wbSessionDto, WebsocketPacketActionEnum.DELETE);
      packetDto.wsPacketSeq = this.websocketManager.wsPacketSeq;

      this.socket.emit(HttpHelper.websocketApi.whiteboardSession.delete.event, packetDto);

      //#### 요청 완료

      this.socket.once(HttpHelper.websocketApi.whiteboardSession.delete.event + HttpHelper.ACK_SIGN,
        (wsPacketDto:WebsocketPacketDto)=>{
          // this.websocketManager.uiService.spin$.next(false);
          switch (wsPacketDto.action) {
            case WebsocketPacketActionEnum.ACK:
              this.websocketManager.wbSessionEventManagerService.wsWbSessionEventEmitter.emit(
                new WbSessionEvent(WbSessionEventEnum.DELETE, wsPacketDto.dataDto as WhiteboardSessionDto, wsPacketDto.additionalData));
              subscriber.next(packetDto.dataDto);
              break;
            case WebsocketPacketActionEnum.NAK:
              subscriber.error(packetDto);
              break;
          }
        })
    });
  }
  private onWbSessionDelete(){
    this.socket.on(HttpHelper.websocketApi.whiteboardSession.delete.event,
      (wsPacketDto:WebsocketPacketDto)=>{
        if (wsPacketDto.action === WebsocketPacketActionEnum.DELETE) {
          //console.log("WsWhiteboardSessionController >> onWbSessionDelete >> 진입함");
          this.websocketManager.wbSessionEventManagerService.wsWbSessionEventEmitter.emit(
            new WbSessionEvent(WbSessionEventEnum.DELETE, wsPacketDto.dataDto as WhiteboardSessionDto, wsPacketDto.additionalData));        }
      });
  }

  /* **************************************************** */
  /* Delete END */
  /* **************************************************** */

  /* *************************************************** */
  /* Cursor Tarcker Handler START */
  /* *************************************************** */
  sendCursorData(newPosition:GachiPointDto){
    //this.websocketManager.uiService.spin$.next(true);
    let packetDto = this.websocketManager.createWbSessionScopePacket(newPosition, WebsocketPacketActionEnum.SPECIAL, "cursor");
    packetDto.wsPacketSeq = this.websocketManager.wsPacketSeq;

    this.socket.emit(HttpHelper.websocketApi.whiteboardSession.update_cursor.event, packetDto);
  }
  private onCursorDataUpdate(){
    this.socket.on(HttpHelper.websocketApi.whiteboardSession.update_cursor.event,
      (wsPacketDto:WebsocketPacketDto)=>{
        if (wsPacketDto.action === WebsocketPacketActionEnum.SPECIAL) {
          this.websocketManager.wbSessionEventManagerService.wsWbSessionEventEmitter.emit(
            new WbSessionEvent(WbSessionEventEnum.UPDATE_CURSOR, null, wsPacketDto.additionalData));
        }
      });
  }


  /* **************************************************** */
  /* Cursor Tarcker Handler END */
  /* **************************************************** */



  public static initInstance(websocketManager){
    WsWhiteboardSessionController.instance = new WsWhiteboardSessionController(websocketManager);
  }

  public static getInstance(){
    if(WsWhiteboardSessionController.instance){
      return WsWhiteboardSessionController.instance;
    }
    else{
      console.warn("경고! 싱글톤 클래스를 초기화 하지 않은 채로 인스턴스에 접근하려는 시도 식별됨!!!");
      return null;
    }
  }

}
