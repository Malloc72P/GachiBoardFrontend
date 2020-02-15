import {Socket} from 'ngx-socket-io';
import {HttpHelper} from '../../../../Model/Helper/http-helper/http-helper';
import {WebsocketManagerService} from '../websocket-manager.service';
import {WebsocketPacketDto} from '../../../../DTO/WebsocketPacketDto/WebsocketPacketDto';
import {WebsocketPacketActionEnum} from '../../../../DTO/WebsocketPacketDto/WebsocketPacketActionEnum';
import {ProjectDto} from '../../../../DTO/ProjectDto/project-dto';

export class WsProjectController {
  private socket:Socket;
  private websocketManager:WebsocketManagerService;
  private static instance:WsProjectController;

  private constructor(websocketManager){
    console.warn("WsProjectController >> constructor >> 진입함");
    this.websocketManager = websocketManager;
    this.socket = this.websocketManager.socket;
    this.onParticipantJoin();
  }


  /* *************************************************** */
  /* WS-Project Controller START */
  /* *************************************************** */

  joinProject(idToken, accessToken, project_id){
    console.warn("WsProjectController >> joinProject >> 진입함");
    let param = {
      idToken : idToken,
      accessToken : accessToken,
      project_id : project_id,
    };
    this.socket.emit(HttpHelper.websocketApi.project.joinProject.event,param);
  }

  private onParticipantJoin(){
    console.warn("WsProjectController >> onParticipantJoin >> 진입함");
    this.socket.on(HttpHelper.websocketApi.project.joinProject.event,
      (wsPacket:WebsocketPacketDto)=>{
      console.log("WebsocketManagerService >> onParticipantJoin >> data : ",wsPacket);
      if(wsPacket.action === WebsocketPacketActionEnum.SPECIAL){
        this.websocketManager.currentProjectDto = wsPacket.dataDto as ProjectDto;
      }
    })
  }

  /* **************************************************** */
  /* WS-Project Controller END */
  /* **************************************************** */



  public static initInstance(websocketManager){
    WsProjectController.instance = new WsProjectController(websocketManager);
  }

  public static getInstance(){
    if(WsProjectController.instance){
      return WsProjectController.instance;
    }
    else{
      console.warn("경고! 싱글톤 클래스를 초기화 하지 않은 채로 인스턴스에 접근하려는 시도 식별됨!!!");
      return null;
    }
  }

}
