import {WebsocketPacketActionEnum, WebsocketPacketScopeEnum} from './WebsocketPacketActionEnum';

export class WebsocketPacketDto {
  public wsPacketSeq;
  public senderIdToken:string;
  public packetScope:WebsocketPacketScopeEnum;
  public namespaceValue:string;
  public dataDto:Object;//패킷의 데이터는 여기에 실려서 감
  public action:WebsocketPacketActionEnum;
  public accessToken;
  public additionalData;//혹시나 추가로 보낼 데이터가 있으면 여기서 채우면 됨
  public specialAction;

  constructor(senderIdToken     : string,
              packetScope       : WebsocketPacketScopeEnum,
              namespaceValue    : string,
              dataDto           : Object,
              action            : WebsocketPacketActionEnum,
              specialAction?    : string) {
    this.senderIdToken = senderIdToken;
    this.packetScope = packetScope;
    this.namespaceValue = namespaceValue;
    this.dataDto = dataDto;
    this.action = action;
    this.specialAction = specialAction;
  }

  clone() :WebsocketPacketDto{
    return Object.assign({}, this);
  }
}
