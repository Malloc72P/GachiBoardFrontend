export class WebsocketEvent {
  public action:WebsocketEventEnum;
  public data;

  constructor(action?:WebsocketEventEnum, data?) {
    this.action = action;
    this.data = data;
  }
}
export enum WebsocketEventEnum {
  GET_KANBAN_DATA
}
