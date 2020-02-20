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
  REDIRECT
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
}

export class HttpHelper {
  //TODO 이런거 json으로 뽑을 수 있으면 뽑아야 함.
  private static readonly ngDomainName        =   "http://skynet765.iptime.org";
  private static readonly ngPort              =   ":44172";
  private static readonly apiServerDomainName =   "http://skynet765.iptime.org";
  private static readonly apiServerPort       =   ":44174";

  // private static readonly apiServerPort       =   ":5858";
  private static readonly contentType         =   'application/json; charset=utf-8';
  private static readonly tokenType           =   'bearer ';

  public static readonly ngUrl   =   HttpHelper.ngDomainName + HttpHelper.ngPort;
  public static readonly apiUrl  =   HttpHelper.apiServerDomainName + HttpHelper.apiServerPort;

  //TODO api정보를 담는 변수임. 얘는 반드시 uri값을 가져야 함.
  //url값을 가지면 안됨. url값을 쓰고 싶으면 apiUrl이랑 합쳐서 써야 함. 그래서 public으로 해놓음.
  public static readonly api = {
    authGoogle : new ApiRequest(
      "/auth/google",   ApiRequestTypeEnum.REDIRECT
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
