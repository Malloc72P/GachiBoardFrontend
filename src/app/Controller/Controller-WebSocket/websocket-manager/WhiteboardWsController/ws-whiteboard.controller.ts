import {Socket} from 'ngx-socket-io';
import {HttpHelper} from '../../../../Model/Helper/http-helper/http-helper';
import {WebsocketManagerService} from '../websocket-manager.service';
import {WebsocketPacketActionEnum} from '../../../../DTO/WebsocketPacketDto/WebsocketPacketActionEnum';
import {WebsocketPacketDto} from '../../../../DTO/WebsocketPacketDto/WebsocketPacketDto';
import {KanbanItemDto} from '../../../../DTO/ProjectDto/KanbanDataDto/KanbanGroupDto/KanbanItemDto/kanban-item-dto';

import {Observable} from 'rxjs';
import {WhiteboardSessionDto} from '../../../../DTO/ProjectDto/WhiteboardSessionDto/whiteboard-session-dto';
import {WbSessionEvent, WbSessionEventEnum} from '../WhiteboardSessionWsController/wb-session-event/wb-session-event';

export class WsWhiteboardController {
  private socket:Socket;
  private websocketManager:WebsocketManagerService;
  private static instance:WsWhiteboardController;

  private constructor(websocketManager){
    console.warn("WsProjectController >> constructor >> 진입함");
    this.websocketManager = websocketManager;
    this.socket = this.websocketManager.socket;
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
              console.log("WsWhiteboardController >> waitRequestCreateWbSession >> wsPacketDto : ",wsPacketDto);
              subscriber.next(packetDto);
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
        if (wsPacketDto.action === WebsocketPacketActionEnum.CREATE) {
          console.log("WsWhiteboardController >> onWbSessionCreated >> wsPacketDto : ",wsPacketDto);
          this.websocketManager.wbSessionEventManagerService.wsWbSessionEventEmitter.emit(
            new WbSessionEvent(WbSessionEventEnum.CREATE, wsPacketDto.dataDto as WhiteboardSessionDto));
        }
      });
  }

  /* **************************************************** */
  /* Request Create END */
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
