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
  SPECIAL,
  OCCUPIED,
  NOT_OCCUPIED
}

export enum WebsocketPacketScopeEnum {
  PROJECT,
  WHITEBOARD
}
