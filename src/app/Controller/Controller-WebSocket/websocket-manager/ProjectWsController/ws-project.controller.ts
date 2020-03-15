import {Socket} from 'ngx-socket-io';
import {HttpHelper, WebsocketValidationCheck} from '../../../../Model/Helper/http-helper/http-helper';
import {WebsocketManagerService} from '../websocket-manager.service';
import {WebsocketPacketDto} from '../../../../DTO/WebsocketPacketDto/WebsocketPacketDto';
import {WebsocketPacketActionEnum} from '../../../../DTO/WebsocketPacketDto/WebsocketPacketActionEnum';
import {ProjectDto} from '../../../../DTO/ProjectDto/project-dto';
import {WebsocketEvent, WebsocketEventEnum} from '../WebsocketEvent/WebsocketEvent';
import {Observable} from 'rxjs';

export class WsProjectController {
  private socket:Socket;
  private websocketManager:WebsocketManagerService;
  private static instance:WsProjectController;

  private constructor(websocketManager){
    console.warn("WsProjectController >> constructor >> 진입함");
    this.websocketManager = websocketManager;
    this.socket = this.websocketManager.socket;
    this.onParticipantJoin();
    this.onProjectUpdate();
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
  waitJoinProject(idToken, accessToken, project_id){
    return new Observable<any>((subscriber)=>{
      console.warn("WsProjectController >> joinProject >> 진입함");
      let param = {
        idToken : idToken,
        accessToken : accessToken,
        project_id : project_id,
      };
      this.socket.emit(HttpHelper.websocketApi.project.joinProject.event,param);

      this.socket.once(HttpHelper.websocketApi.project.joinProject.event + HttpHelper.ACK_SIGN,
        (wsPacket:WebsocketPacketDto)=>{
          console.log("WsProjectController >> waitJoinProject >> recv wsPacket : ",wsPacket);
          switch (wsPacket.action) {
            case WebsocketPacketActionEnum.ACK:
              this.websocketManager.currentProjectDto = wsPacket.dataDto as ProjectDto;
              subscriber.next(this.websocketManager.currentProjectDto);
              break;
            case WebsocketPacketActionEnum.NAK:
              let reason:WebsocketValidationCheck = wsPacket.dataDto as WebsocketValidationCheck;
              let errorMessage = "";
              switch (reason) {
                case WebsocketValidationCheck.INVALID_USER:
                case WebsocketValidationCheck.INVALID_PROJECT:
                case WebsocketValidationCheck.INVALID_PARTICIPANT:
                  errorMessage = "일시적인 오류가 발생했어요. 다시 시도해주세요.";
                  break;
                case WebsocketValidationCheck.KICKED_PARTICIPANT:
                  errorMessage = "프로젝트 관리자가 회원님을 내보낸 것 같아요. 프로젝트 관리자에게 문의해주세요.";
                  break;
              }
              subscriber.error(errorMessage);
              break;
          }
        });
    });

  }

  private onParticipantJoin(){
    console.warn("WsProjectController >> onParticipantJoin >> 진입함");
    this.socket.on(HttpHelper.websocketApi.project.joinProject.event,
      (wsPacket:WebsocketPacketDto)=>{
      console.log("WsProjectController >>  >> wsPacket : ",wsPacket);
      let updatedProjectDto:ProjectDto = wsPacket.dataDto as ProjectDto;
      switch (wsPacket.action) {
        case WebsocketPacketActionEnum.SPECIAL:
          console.log("WsProjectController >> onParticipantJoin >> SPECIAL >> wsPacket : ",wsPacket);
          this.websocketManager.currentProjectDto.participantList = updatedProjectDto.participantList;
          break;
        case WebsocketPacketActionEnum.ACK:
          this.websocketManager.currentProjectDto = wsPacket.dataDto as ProjectDto;
          this.websocketManager.wsEventEmitter.emit(new WebsocketEvent(WebsocketEventEnum.GET_PROJECT_FULL_DATA, wsPacket.dataDto));
          break;
        case WebsocketPacketActionEnum.NAK:
          break;
      }
    })
  }

  /* **************************************************** */
  /* WS-Project Controller END */
  /* **************************************************** */

  private onProjectUpdate(){
    this.socket.on(HttpHelper.websocketApi.project.update.event,
      (wsPacket:WebsocketPacketDto)=>{
      console.log("WsProjectController >> onProjectUpdate >> wsPacket : ",wsPacket);
        let updatedProjectDto:ProjectDto = wsPacket.dataDto as ProjectDto;
        if (wsPacket.action === WebsocketPacketActionEnum.UPDATE) {
          this.websocketManager.currentProjectDto = wsPacket.dataDto as ProjectDto;
          this.websocketManager.wsEventEmitter.emit(new WebsocketEvent(WebsocketEventEnum.UPDATE, wsPacket.dataDto));
        }
      })
  }



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
