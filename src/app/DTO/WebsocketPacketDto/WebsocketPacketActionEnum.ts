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
  DISCONNECT,
  LEAVE,
  SPECIAL,
  OCCUPIED,
  NOT_OCCUPIED,
  CONNECT,
  PRODUCE,
  CONSUME,
  CLOUD_UPDATED,
}

export enum WebsocketPacketScopeEnum {
  PROJECT,
  WHITEBOARD
}
