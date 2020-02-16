export enum WebsocketPacketActionEnum {
  CREATE,
  READ,
  UPDATE,
  DELETE,
  RELOCATE,
  LOCK,
  ACK,
  NAK,
  SPECIAL,
}

export enum WebsocketPacketScopeEnum {
  PROJECT,
  WHITEBOARD
}
