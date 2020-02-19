export enum WebsocketPacketActionEnum {
  CREATE,
  CREATE_TAG,
  READ,
  UPDATE,
  DELETE,
  DELETE_TAG,
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