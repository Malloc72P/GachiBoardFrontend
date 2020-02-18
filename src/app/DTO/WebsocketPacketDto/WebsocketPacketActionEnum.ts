export enum WebsocketPacketActionEnum {
  CREATE,
  CREATE_TAG,
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
