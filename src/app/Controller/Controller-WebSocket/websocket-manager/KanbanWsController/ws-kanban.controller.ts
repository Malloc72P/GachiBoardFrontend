import {Socket} from 'ngx-socket-io';
import {HttpHelper} from '../../../../Model/Helper/http-helper/http-helper';
import {WebsocketManagerService} from '../websocket-manager.service';
import {WebsocketPacketActionEnum} from '../../../../DTO/WebsocketPacketDto/WebsocketPacketActionEnum';
import {KanbanItem} from '../../../../Model/Whiteboard/ProjectSupporter/Kanban/KanbanItem/kanban-item';
import {WebsocketPacketDto} from '../../../../DTO/WebsocketPacketDto/WebsocketPacketDto';
import {KanbanEvent, KanbanEventEnum} from '../../../../Model/Whiteboard/ProjectSupporter/Kanban/KanbanEvent/KanbanEvent';
import {KanbanItemDto} from '../../../../DTO/ProjectDto/KanbanDataDto/KanbanGroupDto/KanbanItemDto/kanban-item-dto';

export class WsKanbanController {
  private socket:Socket;
  private websocketManager:WebsocketManagerService;
  private static instance:WsKanbanController;

  private constructor(websocketManager){
    console.warn("WsProjectController >> constructor >> 진입함");
    this.websocketManager = websocketManager;
    this.socket = this.websocketManager.socket;
    this.onKanbanCreated();
  }


  /* *************************************************** */
  /* WS-Project Controller START */
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
  /* WS-Project Controller END */
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
