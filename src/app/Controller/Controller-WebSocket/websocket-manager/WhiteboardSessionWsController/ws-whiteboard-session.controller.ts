import {Socket} from 'ngx-socket-io';
import {HttpHelper} from '../../../../Model/Helper/http-helper/http-helper';
import {WebsocketManagerService} from '../websocket-manager.service';
import {WebsocketPacketActionEnum} from '../../../../DTO/WebsocketPacketDto/WebsocketPacketActionEnum';
import {WebsocketPacketDto} from '../../../../DTO/WebsocketPacketDto/WebsocketPacketDto';
import {KanbanItemDto} from '../../../../DTO/ProjectDto/KanbanDataDto/KanbanGroupDto/KanbanItemDto/kanban-item-dto';

import {Observable} from 'rxjs';
import {WhiteboardSessionDto} from '../../../../DTO/ProjectDto/WhiteboardSessionDto/whiteboard-session-dto';
import {WbSessionEvent, WbSessionEventEnum} from './wb-session-event/wb-session-event';

export class WsWhiteboardSessionController {
  private socket:Socket;
  private websocketManager:WebsocketManagerService;
  private static instance:WsWhiteboardSessionController;

  private constructor(websocketManager){
    console.warn("WsProjectController >> constructor >> 진입함");
    this.websocketManager = websocketManager;
    this.socket = this.websocketManager.socket;
    this.onWbSessionCreated();
    this.onPinged();
  }


  /* *************************************************** */
  /* Request Create START */
  /* *************************************************** */

  waitRequestCreateWbSession( wbSessionDto:WhiteboardSessionDto ){

    this.websocketManager.uiService.spin$.next(true);

    return new Observable<any>((subscriber)=>{

      let packetDto = this.websocketManager.createProjectScopePacket(wbSessionDto, WebsocketPacketActionEnum.CREATE);
      packetDto.wsPacketSeq = this.websocketManager.wsPacketSeq;

      this.socket.emit(HttpHelper.websocketApi.whiteboardSession.create.event, packetDto);

      //#### 요청 완료

      this.socket.once(HttpHelper.websocketApi.whiteboardSession.create.event,
        (wsPacketDto:WebsocketPacketDto)=>{
          this.websocketManager.uiService.spin$.next(false);
          switch (wsPacketDto.action) {
            case WebsocketPacketActionEnum.ACK:
              console.log("WsWhiteboardSessionController >> waitRequestCreateWbSession >> wsPacketDto : ",wsPacketDto);
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
        console.log("WsWhiteboardSessionController >> onWbSessionCreated >> wsPacketDto : ",wsPacketDto);
        this.websocketManager.wbSessionEventManagerService.wsWbSessionEventEmitter.emit(
          new WbSessionEvent(WbSessionEventEnum.CREATE, wsPacketDto.dataDto as WhiteboardSessionDto));
      });
  }

  /* **************************************************** */
  /* Request Create END */
  /* **************************************************** */

  /* *************************************************** */
  /* Request Create START */
  /* *************************************************** */

  waitRequestJoinWbSession( wbSessionDto:WhiteboardSessionDto ){

    this.websocketManager.uiService.spin$.next(true);

    return new Observable<any>((subscriber)=>{

      let packetDto = this.websocketManager.createProjectScopePacket(wbSessionDto, WebsocketPacketActionEnum.JOIN);
      packetDto.wsPacketSeq = this.websocketManager.wsPacketSeq;

      this.socket.emit(HttpHelper.websocketApi.whiteboardSession.join.event, packetDto);

      //#### 요청 완료

      this.socket.once(HttpHelper.websocketApi.whiteboardSession.join.event,
        (wsPacketDto:WebsocketPacketDto)=>{
          this.websocketManager.uiService.spin$.next(false);
          switch (wsPacketDto.action) {
            case WebsocketPacketActionEnum.ACK:
              console.log("WsWhiteboardSessionController >> waitRequestJoinWbSession >> wsPacketDto : ",wsPacketDto);
              this.websocketManager.currentWbSessionDto = wsPacketDto.dataDto as WhiteboardSessionDto;
              subscriber.next(packetDto.dataDto);
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
          console.log("WsWhiteboardSessionController >> onWbSessionCreated >> wsPacketDto : ",wsPacketDto);
          this.websocketManager.wbSessionEventManagerService.wsWbSessionEventEmitter.emit(
            new WbSessionEvent(WbSessionEventEnum.JOIN, wsPacketDto.dataDto as WhiteboardSessionDto));
        }
      });
  }

  /* **************************************************** */
  /* Request Create END */
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

      this.socket.once(HttpHelper.websocketApi.whiteboardSession.read.event,
        (wsPacketDto:WebsocketPacketDto)=>{
          this.websocketManager.uiService.spin$.next(false);
          switch (wsPacketDto.action) {
            case WebsocketPacketActionEnum.ACK:
              console.log("WsWhiteboardSessionController >> waitRequestCreateWbSession >> wsPacketDto : ",wsPacketDto);
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

  requestPingToWbSession() :Observable<any>{
    //this.websocketManager.uiService.spin$.next(true);

    return new Observable<any>((subscriber)=>{

      let packetDto = this.websocketManager.createWbSessionScopePacket({}, WebsocketPacketActionEnum.UPDATE);
      packetDto.wsPacketSeq = this.websocketManager.wsPacketSeq;

      this.socket.emit(HttpHelper.websocketApi.whiteboardSession.update.event, packetDto);

      //#### 요청 완료

      this.socket.once(HttpHelper.websocketApi.whiteboardSession.update.event,
        (wsPacketDto:WebsocketPacketDto)=>{
          //this.websocketManager.uiService.spin$.next(false);
          switch (wsPacketDto.action) {
            case WebsocketPacketActionEnum.ACK:
              //console.log("WsWhiteboardSessionController >> requestPingToWbSession >> wsPacketDto : ",wsPacketDto);
              subscriber.next(wsPacketDto);
              break;
            case WebsocketPacketActionEnum.NAK:
              subscriber.error(packetDto);
              break;
          }
        })
    });
  }
  private onPinged(){
    this.socket.on(HttpHelper.websocketApi.whiteboardSession.update.event,
      (wsPacketDto:WebsocketPacketDto)=>{
        if (wsPacketDto.action === WebsocketPacketActionEnum.UPDATE) {
          console.log("WsWhiteboardSessionController >> onPinged >> wsPacketDto : ",wsPacketDto);
        }
      });
  }



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
