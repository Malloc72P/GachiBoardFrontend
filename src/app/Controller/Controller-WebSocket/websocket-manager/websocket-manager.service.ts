import {EventEmitter, Injectable, Output} from '@angular/core';
import {Socket} from 'ngx-socket-io';
import {AuthRequestService} from '../../SocialLogin/auth-request/auth-request.service';
import {WsProjectController} from './ProjectWsController/ws-project.controller';
import {WsKanbanController} from './KanbanWsController/ws-kanban.controller';
import {UserDTO} from '../../../DTO/user-dto';
import {AuthEvent, AuthEventEnum} from '../../SocialLogin/auth-request/AuthEvent/AuthEvent';
import {ProjectDto} from '../../../DTO/ProjectDto/project-dto';
import {WebsocketPacketDto} from '../../../DTO/WebsocketPacketDto/WebsocketPacketDto';
import {WebsocketPacketActionEnum, WebsocketPacketScopeEnum} from '../../../DTO/WebsocketPacketDto/WebsocketPacketActionEnum';
import {NotVerifiedKanbanItem} from './NotVerifiedKanbanItem/NotVerifiedKanbanItem';
import {HttpHelper} from '../../../Model/Helper/http-helper/http-helper';
import {KanbanItem} from '../../../Model/Whiteboard/ProjectSupporter/Kanban/KanbanItem/kanban-item';
import {KanbanEventManagerService} from '../../../Model/Whiteboard/ProjectSupporter/Kanban/kanban-event-manager.service';
import {KanbanItemDto} from '../../../DTO/ProjectDto/KanbanDataDto/KanbanGroupDto/KanbanItemDto/kanban-item-dto';

@Injectable({
  providedIn: 'root'
})
export class WebsocketManagerService {
  @Output() wsEventEmitter:EventEmitter<any> = new EventEmitter<any>();
  //SocketIO를 통해 데이터를 불러오고 싶을때 사용
  //미리 해당 이벤트이미터를 subscribe하고, 데이터를 요청하는 메세지를 전송하면 됨

  public isConnected = false;
  private _userInfo:UserDTO;
  public currentProjectDto:ProjectDto;
  public notVerifiedKanbanItems:Array<NotVerifiedKanbanItem>;
  private _wsPacketSeq = 0;
  constructor(
    private _socket:Socket,
    private authRequestService:AuthRequestService,
    public kanbanEventManagerService:KanbanEventManagerService
  ) {
    this.authRequestService.authEventEmitter.subscribe((authEvent:AuthEvent)=>{
      if(authEvent.action === AuthEventEnum.SIGN_IN){
        this._userInfo = authEvent.userInfo;
      }
    });
    console.warn("WebsocketManagerService >> constructor >> 진입함");
    //#### WS Controller 초기화
    WsProjectController.initInstance(this);
    WsKanbanController.initInstance(this);

    this.notVerifiedKanbanItems = new Array<NotVerifiedKanbanItem>();
  }

  public saveNotVerifiedKanbanItem(packetDto:WebsocketPacketDto, kanbanItem:KanbanItem){
    this.notVerifiedKanbanItems.push(
      new NotVerifiedKanbanItem(packetDto,kanbanItem));
  }
  public verifyKanbanItem(wsPacketDto:WebsocketPacketDto){
    let verifiedIdx = -1;
    let foundNotVerified:NotVerifiedKanbanItem = null;
    for (let i = 0 ; i < this.notVerifiedKanbanItems.length; i++){
      let notVerifiedItem = this.notVerifiedKanbanItems[i];
      foundNotVerified = notVerifiedItem;
      if(notVerifiedItem.wsPacketDto.wsPacketSeq === wsPacketDto.wsPacketSeq){
        verifiedIdx = i;
        notVerifiedItem.kanbanItem._id = wsPacketDto.dataDto["_id"];
        break;
      }
    }//for

    if(verifiedIdx > -1){
      let wsKanbanController = WsKanbanController.getInstance();
      switch (foundNotVerified.wsPacketDto.action) {
        case WebsocketPacketActionEnum.CREATE:
          wsKanbanController.createFromWsManager(foundNotVerified.wsPacketDto);
          break;
        case WebsocketPacketActionEnum.UPDATE:
          break;
        case WebsocketPacketActionEnum.DELETE:
          wsKanbanController.delFromWsManager(foundNotVerified.wsPacketDto);
          break;
        case WebsocketPacketActionEnum.RELOCATE:
        case WebsocketPacketActionEnum.LOCK:
            let kanbanItemDto = wsPacketDto.dataDto as KanbanItemDto;
            foundNotVerified.kanbanItem.lockedBy = kanbanItemDto.lockedBy;
            break;

      }
      this.notVerifiedKanbanItems.splice(verifiedIdx, 1);
    }
    console.log("WebsocketManagerService >> verifyKanbanItem >> notVerifiedKanbanItems : ",this.notVerifiedKanbanItems);
  }

  resetSocket(){
    this.socket.disconnect();
    this.socket.connect();
    this.isConnected = false;
  }

  get socket(): Socket {
    return this._socket;
  }

  get userInfo(): UserDTO {
    return this._userInfo;
  }

  createProjectScopePacket(dataDto, action:WebsocketPacketActionEnum, specialAction?){
    let newPacket:WebsocketPacketDto = null;
    if(action != WebsocketPacketActionEnum.SPECIAL){
      newPacket = new WebsocketPacketDto(
        this._userInfo.idToken,
        WebsocketPacketScopeEnum.PROJECT,
        this.currentProjectDto._id,
        dataDto,
        action);
    } else{
      newPacket = new WebsocketPacketDto(
        this._userInfo.idToken,
        WebsocketPacketScopeEnum.PROJECT,
        this.currentProjectDto._id,
        dataDto,
        action, specialAction);
    }
    newPacket.accessToken = this.userInfo.accessToken;
    return newPacket;
  }
  createWbScopePacket(){

  }

  get wsPacketSeq(): number {
    return this._wsPacketSeq++;
  }
}
