import ServerSetting from './ServerSetting.json';

class ApiRequest {
  constructor(url, requestType){
    this.uri = url;
    this.requestType = requestType;
  }
  public uri: string;
  public requestType: ApiRequestTypeEnum;
}
class WebSocketRequest {
  constructor(event, requestType){
    this.event = event;
    this.requestType = requestType;
  }
  public event: string;
  public requestType: WebSocketTypeEnum;
}
export enum ApiRequestTypeEnum {
  GET,
  POST,
  PATCH,
  DELETE,
  REDIRECT,
}
export enum WebSocketTypeEnum {
  CREATE,
  CREATE_TAG,
  READ,
  UPDATE,
  DELETE,
  DELETE_TAG,
  RELOCATE,
  LOCK,
  UNLOCK,
  JOIN,
  DISCONNECT,
  OCCUPIED,
  NOT_OCCUPIED,
  UPDATE_ZINDEX
}
export enum Z_INDEX_ACTION {
  BRING_TO_FRONT,
  SEND_TO_BACK
}
export enum SpecialAction {
  PASTE_COMPLETE,
  RELOCATE_PASTE_COMPLETE
}
export enum REST_RESPONSE{
  ACK = 100,
  NOT_AUTHORIZED = 400,
}

export class HttpHelper {
  //TODO 이런거 json으로 뽑을 수 있으면 뽑아야 함.
  private static readonly ngDomainName        =   ServerSetting.ngDomain;
  private static readonly ngPort              =   ServerSetting.ngPort;
  private static readonly apiServerDomainName =   ServerSetting.apiDomain;
  private static readonly apiServerPort       =   ServerSetting.apiPort;
  // private static readonly apiServerPort       =   ":5858";
  private static readonly contentType         =   ServerSetting.contentType;
  private static readonly tokenType           =   ServerSetting.tokenType;

  public static readonly ngUrl   =   HttpHelper.ngDomainName + HttpHelper.ngPort;
  public static readonly apiUrl  =   HttpHelper.apiServerDomainName + HttpHelper.apiServerPort;

  //TODO api정보를 담는 변수임. 얘는 반드시 uri값을 가져야 함.
  //url값을 가지면 안됨. url값을 쓰고 싶으면 apiUrl이랑 합쳐서 써야 함. 그래서 public으로 해놓음.
  public static readonly api = {
    authGoogle : new ApiRequest(
      "/auth/google",   ApiRequestTypeEnum.REDIRECT
    ),
    authKakao : new ApiRequest(
      "/auth/kakao",   ApiRequestTypeEnum.REDIRECT
    ),
    authNaver : new ApiRequest(
      "/auth/naver",   ApiRequestTypeEnum.REDIRECT
    ),
    protected : new ApiRequest(
      "/auth/protected",     ApiRequestTypeEnum.POST
    ),
    signOut: new ApiRequest(
      "/auth/signOut", ApiRequestTypeEnum.POST
    ),
    project : {
      create : new ApiRequest(
        "/project", ApiRequestTypeEnum.POST
      ),
      getList : new ApiRequest(
        "/project", ApiRequestTypeEnum.GET
      ),
      generateInviteCode : new ApiRequest(
        "/inviteCode", ApiRequestTypeEnum.POST
      ),
      submitInviteCode : new ApiRequest(
        "/inviteCode", ApiRequestTypeEnum.GET
      ),
      invitation : new ApiRequest(
        "/invitation", ApiRequestTypeEnum.REDIRECT
      ),
      exit : new ApiRequest(
        "/project", ApiRequestTypeEnum.DELETE
      ),
      patch : new ApiRequest(
        "/project", ApiRequestTypeEnum.PATCH
      )
    }
  };

  public static readonly websocketApi = {
    project : {
      joinProject : new WebSocketRequest(
        "project_join",WebSocketTypeEnum.READ
      )
    },
    kanban : {
      create : new WebSocketRequest(
        "kanban_create", WebSocketTypeEnum.CREATE
      ),
      create_tag : new WebSocketRequest(
        "kanban_create_tag", WebSocketTypeEnum.CREATE_TAG
      ),
      update : new WebSocketRequest(
        "kanban_update", WebSocketTypeEnum.UPDATE
      ),
      delete : new WebSocketRequest(
        "kanban_delete", WebSocketTypeEnum.DELETE
      ),
      delete_tag : new WebSocketRequest(
        "kanban_delete_tag", WebSocketTypeEnum.DELETE_TAG
      ),
      relocate : new WebSocketRequest(
        "kanban_relocate", WebSocketTypeEnum.RELOCATE
      ),
      lock : new WebSocketRequest(
        "kanban_lock", WebSocketTypeEnum.LOCK
      ),
      unlock : new WebSocketRequest(
        "kanban_unlock", WebSocketTypeEnum.UNLOCK
      ),
      read : new WebSocketRequest(
        "kanban_read", WebSocketTypeEnum.READ
      ),
    },
    whiteboardSession : {
      read : new WebSocketRequest(
        "wbSession_read", WebSocketTypeEnum.READ
      ),
      create : new WebSocketRequest(
        "wbSession_create", WebSocketTypeEnum.CREATE
      ),
      update : new WebSocketRequest(
        "wbSession_update", WebSocketTypeEnum.UPDATE
      ),
      delete : new WebSocketRequest(
        "wbSession_delete", WebSocketTypeEnum.DELETE
      ),
      lock : new WebSocketRequest(
        "wbSession_lock", WebSocketTypeEnum.LOCK
      ),
      unlock : new WebSocketRequest(
        "wbSession_unlock", WebSocketTypeEnum.UNLOCK
      ),
      join : new WebSocketRequest(
        "wbSession_join",WebSocketTypeEnum.JOIN
      ),
      disconnect : new WebSocketRequest(
        "wbSession_disconnect",WebSocketTypeEnum.DISCONNECT
      ),
      create_cursor : new WebSocketRequest(
        "wbSession_create_cursor", WebSocketTypeEnum.CREATE
      ),
      update_cursor : new WebSocketRequest(
        "wbSession_update_cursor", WebSocketTypeEnum.UPDATE
      ),
      remove_cursor : new WebSocketRequest(
        "wbSession_remove_cursor", WebSocketTypeEnum.DELETE
      ),
    },
    whiteboardItem : {
      read : new WebSocketRequest(
        "wbItem_read", WebSocketTypeEnum.READ
      ),
      create : new WebSocketRequest(
        "wbItem_create", WebSocketTypeEnum.CREATE
      ),
      create_multiple : new WebSocketRequest(
        "wbItem_create_multiple", WebSocketTypeEnum.CREATE
      ),
      update : new WebSocketRequest(
        "wbItem_update", WebSocketTypeEnum.UPDATE
      ),
      update_multiple : new WebSocketRequest(
        "wbItem_update_multiple", WebSocketTypeEnum.UPDATE
      ),
      delete : new WebSocketRequest(
        "wbItem_delete", WebSocketTypeEnum.DELETE
      ),
      delete_multiple : new WebSocketRequest(
        "wbItem_delete_multiple", WebSocketTypeEnum.DELETE
      ),
      lock : new WebSocketRequest(
        "wbItem_lock", WebSocketTypeEnum.LOCK
      ),
      unlock : new WebSocketRequest(
        "wbItem_unlock", WebSocketTypeEnum.UNLOCK
      ),
      occupied : new WebSocketRequest(
        "wbItem_occupied", WebSocketTypeEnum.OCCUPIED
      ),
      notOccupied : new WebSocketRequest(
        "wbItem_unOccupied", WebSocketTypeEnum.NOT_OCCUPIED
      ),
      updateZIndex : new WebSocketRequest(
        "wbItem_update_ZIndex", WebSocketTypeEnum.UPDATE_ZINDEX
      )
    }
  };


  public static getContentType(){
    return HttpHelper.contentType;
  }
  public static getTokenType(){
    return HttpHelper.tokenType;
  }

  public static redirectTo(uri){
    window.location.href = HttpHelper.apiUrl + uri;
  }
}
