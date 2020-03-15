export enum WebsocketPacketActionEnum {
  CREATE,
  CREATE_MULTIPLE,
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
  JOIN,
  LEAVE,
  SPECIAL,
  OCCUPIED,
  NOT_OCCUPIED,
  CONNECT,
  PRODUCE,
  CONSUME,
}

export enum WebsocketPacketScopeEnum {
  PROJECT,
  WHITEBOARD
}
