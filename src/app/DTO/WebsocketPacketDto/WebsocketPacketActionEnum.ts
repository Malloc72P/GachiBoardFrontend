export enum WebsocketPacketActionEnum {
  CREATE,
  READ,
  UPDATE,
  DELETE,
  RELOCATE,
  LOCK,
  UNLOCK,
  ACK,
  NAK,
  SPECIAL,
}

export enum WebsocketPacketScopeEnum {
  PROJECT,
  WHITEBOARD
}
