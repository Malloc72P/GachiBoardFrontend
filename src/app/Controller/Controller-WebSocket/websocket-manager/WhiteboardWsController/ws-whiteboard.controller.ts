import {Socket} from 'ngx-socket-io';
import {HttpHelper, Z_INDEX_ACTION} from '../../../../Model/Helper/http-helper/http-helper';
import {WebsocketManagerService} from '../websocket-manager.service';
import {WebsocketPacketActionEnum} from '../../../../DTO/WebsocketPacketDto/WebsocketPacketActionEnum';
import {WebsocketPacketDto} from '../../../../DTO/WebsocketPacketDto/WebsocketPacketDto';

import {Observable} from 'rxjs';
import {WbItemEvent, WbItemEventEnum} from './wb-item-event/wb-item-event';
import {WhiteboardItemDto} from '../../../../DTO/WhiteboardItemDto/whiteboard-item-dto';

import {ItemLifeCycleEnum} from '../../../../Model/Whiteboard/Whiteboard-Item/WhiteboardItemLifeCycle/WhiteboardItemLifeCycle';
import {WhiteboardItemType} from '../../../../Model/Helper/data-type-enum/data-type.enum';
import {SimpleRasterDto} from '../../../../DTO/WhiteboardItemDto/WhiteboardShapeDto/EditableRasterDto/SimpleRasterDto/simple-raster-dto';
import {GlobalSelectedGroupDto} from '../../../../DTO/WhiteboardItemDto/ItemGroupDto/GlobalSelectedGroupDto/GlobalSelectedGroupDto';

export class WsWhiteboardController {
  private socket:Socket;
  private websocketManager:WebsocketManagerService;
  private static instance:WsWhiteboardController;

  private constructor(websocketManager){
    console.warn("WsProjectController >> constructor >> 진입함");
    this.websocketManager = websocketManager;
    this.socket = this.websocketManager.socket;
    this.onWbItemCreated();
    this.onWbItemDeleted();
    this.onWbItemUpdated();
    this.onWbItemLocked();
    this.onWbItemUnlocked();
    this.onMultipleWbItemCreated();
    this.onWbItemOccupied();
    this.onWbItemNotOccupied();
    this.onWbItemUpdateZIndexd();
    this.onMultipleWbItemUpdated();
    this.onMultipleWbItemDeleted();
  }


  /* *************************************************** */
  /* Request Create START */
  /* *************************************************** */
  waitRequestGetWbItemList( ){

    this.websocketManager.uiService.spin$.next(true);

    return new Observable<any>((subscriber)=>{

      let packetDto = this.websocketManager.createWbSessionScopePacket({},WebsocketPacketActionEnum.READ);
      packetDto.wsPacketSeq = this.websocketManager.wsPacketSeq;

      this.socket.emit(HttpHelper.websocketApi.whiteboardItem.read.event, packetDto);

      //#### 요청 완료

      this.socket.once(HttpHelper.websocketApi.whiteboardItem.read.event,
        (wsPacketDto:WebsocketPacketDto)=>{
          this.websocketManager.uiService.spin$.next(false);
          switch (wsPacketDto.action) {
            case WebsocketPacketActionEnum.ACK:
              // console.log("WsWhiteboardController >> waitRequestGetWbItemList >> wsPacketDto : ",wsPacketDto);
              subscriber.next(wsPacketDto);
              break;
            case WebsocketPacketActionEnum.NAK:
              subscriber.error(wsPacketDto);
              break;
          }
        })
    });
  }
  /* **************************************************** */
  /* Request Create Multiple WbItem END */
  /* **************************************************** */

  /* *************************************************** */
  /* Request Create START */
  /* *************************************************** */
  waitRequestCreateWbItem( wbItemDto:WhiteboardItemDto ){

    //this.websocketManager.uiService.spin$.next(true);

    return new Observable<any>((subscriber)=>{

      let packetDto = this.websocketManager.createWbSessionScopePacket(wbItemDto,WebsocketPacketActionEnum.CREATE);
      packetDto.wsPacketSeq = this.websocketManager.wsPacketSeq;

      this.socket.emit(HttpHelper.websocketApi.whiteboardItem.create.event, packetDto);

      //#### 요청 완료

      this.socket.once(HttpHelper.websocketApi.whiteboardItem.create.event,
        (wsPacketDto:WebsocketPacketDto)=>{
          //this.websocketManager.uiService.spin$.next(false);
          switch (wsPacketDto.action) {
            case WebsocketPacketActionEnum.ACK:
              // console.log("WsWhiteboardController >> waitRequestCreateWbItem >> wsPacketDto : ",wsPacketDto);
              subscriber.next(wsPacketDto);
              break;
            case WebsocketPacketActionEnum.NAK:
              subscriber.error(wsPacketDto);
              break;
          }
        })
    });
  }

  private onWbItemCreated(){
    this.socket.on(HttpHelper.websocketApi.whiteboardItem.create.event,
      (wsPacketDto:WebsocketPacketDto)=>{
        if (wsPacketDto.action === WebsocketPacketActionEnum.CREATE) {
          // console.log("WsWhiteboardController >> onWbItemCreated >> wsPacketDto : ",wsPacketDto);

          this.websocketManager.wbItemEventManagerService.wsWbItemEventEmitter.emit(
            new WbItemEvent( WbItemEventEnum.CREATE, wsPacketDto.dataDto as WhiteboardItemDto)
          );

        }
      });
  }
  /* **************************************************** */
  /* Request Create WbItem END */
  /* **************************************************** */

  /* *************************************************** */
  /* Request Create Multiple START */
  /* *************************************************** */
  waitRequestCreateMultipleWbItem( wbItemDtos:Array<WhiteboardItemDto> ){

    //this.websocketManager.uiService.spin$.next(true);

    return new Observable<any>((subscriber)=>{

      let packetDto = this.websocketManager.createWbSessionScopePacket(wbItemDtos,WebsocketPacketActionEnum.CREATE_MULTIPLE);
      packetDto.wsPacketSeq = this.websocketManager.wsPacketSeq;

      // console.log("WsWhiteboardController >> testing >> packetDto : ",packetDto);

      this.socket.emit(HttpHelper.websocketApi.whiteboardItem.create_multiple.event, packetDto);

      //#### 요청 완료

      this.socket.once(HttpHelper.websocketApi.whiteboardItem.create_multiple.event,
        (wsPacketDto:WebsocketPacketDto)=>{
          //this.websocketManager.uiService.spin$.next(false);
          switch (wsPacketDto.action) {
            case WebsocketPacketActionEnum.ACK:
              // console.log("WsWhiteboardController >> waitRequestCreateWbItem >> wsPacketDto : ",wsPacketDto);
              subscriber.next(wsPacketDto);
              break;
            case WebsocketPacketActionEnum.NAK:
              subscriber.error(wsPacketDto);
              break;
          }
        })
    });
  }

  private onMultipleWbItemCreated(){
    this.socket.on(HttpHelper.websocketApi.whiteboardItem.create_multiple.event,
      (wsPacketDto:WebsocketPacketDto)=>{
        if (wsPacketDto.action === WebsocketPacketActionEnum.CREATE_MULTIPLE) {
          // console.log("WsWhiteboardController >> onWbItemCreated >> wsPacketDto : ",wsPacketDto);

          this.websocketManager.wbItemEventManagerService.wsWbItemEventEmitter.emit(
            new WbItemEvent( WbItemEventEnum.CREATE_MULTIPLE, null, wsPacketDto.dataDto)
          );

        }
      });
  }
  /* **************************************************** */
  /* Request Create Multiple WbItem END */
  /* **************************************************** */

  /* *************************************************** */
  /* Request Update START */
  /* *************************************************** */
  waitRequestUpdateWbItem( wbItemDto:WhiteboardItemDto){
    //this.websocketManager.uiService.spin$.next(true);
    return new Observable<any>((subscriber)=>{

      if(wbItemDto.type === WhiteboardItemType.SIMPLE_RASTER){
        let simpleRasterDto:SimpleRasterDto = wbItemDto as SimpleRasterDto;
        simpleRasterDto.imageBlob = null;
      }

      let packetDto = this.websocketManager.createWbSessionScopePacket(wbItemDto,WebsocketPacketActionEnum.UPDATE);
      packetDto.wsPacketSeq = this.websocketManager.wsPacketSeq;

      this.socket.emit(HttpHelper.websocketApi.whiteboardItem.update.event, packetDto);

      //#### 요청 완료

      this.socket.once(HttpHelper.websocketApi.whiteboardItem.update.event,
        (wsPacketDto:WebsocketPacketDto)=>{
          //this.websocketManager.uiService.spin$.next(false);
          switch (wsPacketDto.action) {
            case WebsocketPacketActionEnum.ACK:
              // console.log("WsWhiteboardController >> waitRequestUpdateWbItem >> wsPacketDto : ",wsPacketDto);
              subscriber.next(wsPacketDto);
              break;
            case WebsocketPacketActionEnum.NAK:
              subscriber.error(wsPacketDto);
              break;
          }
        })
    });
  }

  private onWbItemUpdated(){
    this.socket.on(HttpHelper.websocketApi.whiteboardItem.update.event,
      (wsPacketDto:WebsocketPacketDto)=>{
        if (wsPacketDto.action === WebsocketPacketActionEnum.UPDATE) {
          // console.log("WsWhiteboardController >> onWbItemUpdated >> wsPacketDto : ",wsPacketDto);

          this.websocketManager.wbItemEventManagerService.wsWbItemEventEmitter.emit(
            new WbItemEvent(
              WbItemEventEnum.UPDATE,
              wsPacketDto.dataDto as WhiteboardItemDto,
              wsPacketDto.additionalData as ItemLifeCycleEnum)
          );

        }
      });
  }
  /* **************************************************** */
  /* Request Update END */
  /* **************************************************** */

  /* *************************************************** */
  /* Request Multiple Update START */
  /* *************************************************** */
  waitRequestUpdateMultipleWbItem( wbItemDtos:Array<WhiteboardItemDto>, gsgDto?:GlobalSelectedGroupDto){
    //this.websocketManager.uiService.spin$.next(true);
    return new Observable<any>((subscriber)=>{


      for(let wbItemDto of wbItemDtos) {
        if (wbItemDto.type === WhiteboardItemType.SIMPLE_RASTER) {
          let simpleRasterDto: SimpleRasterDto = wbItemDto as SimpleRasterDto;
          simpleRasterDto.imageBlob = null;
        }
      }
      this.setGsgDto(gsgDto);

      let packetDto = this.websocketManager.createWbSessionScopePacket(wbItemDtos,WebsocketPacketActionEnum.UPDATE);
      packetDto.wsPacketSeq = this.websocketManager.wsPacketSeq;
      packetDto.additionalData = gsgDto;

      this.socket.emit(HttpHelper.websocketApi.whiteboardItem.update_multiple.event, packetDto);

      //#### 요청 완료

      this.socket.once(HttpHelper.websocketApi.whiteboardItem.update_multiple.event,
        (wsPacketDto:WebsocketPacketDto)=>{
          //this.websocketManager.uiService.spin$.next(false);
          switch (wsPacketDto.action) {
            case WebsocketPacketActionEnum.ACK:
              // console.log("WsWhiteboardController >> waitRequestUpdateWbItem >> wsPacketDto : ",wsPacketDto);
              subscriber.next(wsPacketDto);
              break;
            case WebsocketPacketActionEnum.NAK:
              subscriber.error(wsPacketDto);
              break;
          }
        })
    });
  }

  private onMultipleWbItemUpdated(){
    this.socket.on(HttpHelper.websocketApi.whiteboardItem.update_multiple.event,
      (wsPacketDto:WebsocketPacketDto)=>{
        if (wsPacketDto.action === WebsocketPacketActionEnum.UPDATE) {
          // console.log("WsWhiteboardController >> onWbItemUpdated >> wsPacketDto : ",wsPacketDto);

          this.websocketManager.wbItemEventManagerService.wsWbItemEventEmitter.emit(
            new WbItemEvent(
              WbItemEventEnum.UPDATE_MULTIPLE,
              wsPacketDto.dataDto,
              wsPacketDto.additionalData
            )
          );

        }
      });
  }
  /* **************************************************** */
  /* Request Multiple Update END */
  /* **************************************************** */

  /* *************************************************** */
  /* Request UpdateZIndex START */
  /* *************************************************** */
  waitRequestUpdateZIndexWbItem( wbItemDtos:Array<WhiteboardItemDto>, zIndexAction:Z_INDEX_ACTION){
    //this.websocketManager.uiService.spin$.next(true);
    return new Observable<any>((subscriber)=>{

      for(let wbItemDto of wbItemDtos) {
        if (wbItemDto.type === WhiteboardItemType.SIMPLE_RASTER) {
          let simpleRasterDto: SimpleRasterDto = wbItemDto as SimpleRasterDto;
          simpleRasterDto.imageBlob = null;
        }
      }

      let packetDto = this.websocketManager.createWbSessionScopePacket(wbItemDtos,WebsocketPacketActionEnum.UPDATE);
      packetDto.wsPacketSeq = this.websocketManager.wsPacketSeq;
      packetDto.additionalData = zIndexAction;

      this.socket.emit(HttpHelper.websocketApi.whiteboardItem.updateZIndex.event, packetDto);

      //#### 요청 완료

      this.socket.once(HttpHelper.websocketApi.whiteboardItem.updateZIndex.event,
        (wsPacketDto:WebsocketPacketDto)=>{
          //this.websocketManager.uiService.spin$.next(false);
          switch (wsPacketDto.action) {
            case WebsocketPacketActionEnum.ACK:
              // console.log("WsWhiteboardController >> waitRequestUpdateZIndexWbItem >> wsPacketDto : ",wsPacketDto);
              subscriber.next(wsPacketDto);
              break;
            case WebsocketPacketActionEnum.NAK:
              subscriber.error(wsPacketDto);
              break;
          }
        })
    });
  }

  private onWbItemUpdateZIndexd(){
    this.socket.on(HttpHelper.websocketApi.whiteboardItem.updateZIndex.event,
      (wsPacketDto:WebsocketPacketDto)=>{
        if (wsPacketDto.action === WebsocketPacketActionEnum.UPDATE) {
          // console.log("WsWhiteboardController >> onWbItemUpdated >> wsPacketDto : ",wsPacketDto);

          this.websocketManager.wbItemEventManagerService.wsWbItemEventEmitter.emit(
            new WbItemEvent(WbItemEventEnum.UPDATE_ZIndex,null, wsPacketDto.additionalData));
        }
      });
  }
  /* **************************************************** */
  /* Request UpdateZIndex END */
  /* **************************************************** */

  /* *************************************************** */
  /* Request Delete START */
  /* *************************************************** */
  waitRequestDeleteWbItem( wbItemDto:WhiteboardItemDto ){

    //this.websocketManager.uiService.spin$.next(true);

    return new Observable<any>((subscriber)=>{

      if (wbItemDto.type === WhiteboardItemType.SIMPLE_RASTER) {
        let simpleRasterDto: SimpleRasterDto = wbItemDto as SimpleRasterDto;
        simpleRasterDto.imageBlob = null;
      }


      let packetDto = this.websocketManager.createWbSessionScopePacket(wbItemDto,WebsocketPacketActionEnum.DELETE);
      packetDto.wsPacketSeq = this.websocketManager.wsPacketSeq;

      this.socket.emit(HttpHelper.websocketApi.whiteboardItem.delete.event, packetDto);

      //#### 요청 완료

      this.socket.once(HttpHelper.websocketApi.whiteboardItem.delete.event,
        (wsPacketDto:WebsocketPacketDto)=>{
          //this.websocketManager.uiService.spin$.next(false);
          switch (wsPacketDto.action) {
            case WebsocketPacketActionEnum.ACK:
              // console.log("WsWhiteboardController >> waitRequestDeleteWbItem >> wsPacketDto : ",wsPacketDto);
              subscriber.next(wsPacketDto);
              break;
            case WebsocketPacketActionEnum.NAK:
              subscriber.error(wsPacketDto);
              break;
          }
        })
    });
  }

  private onWbItemDeleted(){
    this.socket.on(HttpHelper.websocketApi.whiteboardItem.delete.event,
      (wsPacketDto:WebsocketPacketDto)=>{
        if (wsPacketDto.action === WebsocketPacketActionEnum.DELETE) {
          // console.log("WsWhiteboardController >> onWbItemDeleted >> wsPacketDto : ",wsPacketDto);

          this.websocketManager.wbItemEventManagerService.wsWbItemEventEmitter.emit(
            new WbItemEvent( WbItemEventEnum.DELETE, wsPacketDto.dataDto as WhiteboardItemDto)
          );

        }
      });
  }
  /* **************************************************** */
  /* Request Delete Multiple END */
  /* **************************************************** */

  /* *************************************************** */
  /* Request Delete START */
  /* *************************************************** */
  waitRequestDeleteMultipleWbItem( wbItemDtos:Array<WhiteboardItemDto> ){

    //this.websocketManager.uiService.spin$.next(true);

    return new Observable<any>((subscriber)=>{
      let deleteList:Array<WhiteboardItemDto> = new Array<WhiteboardItemDto>();
      for(let wbItemDto of wbItemDtos) {
        deleteList.push(wbItemDto);
      }
      let idx = deleteList.length;
      while (idx--){
        let wbItemDto:WhiteboardItemDto = deleteList[idx];
        if (wbItemDto.type === WhiteboardItemType.SIMPLE_RASTER) {
          let simpleRasterDto: SimpleRasterDto = wbItemDto as SimpleRasterDto;
          let newSimpleRasterDto:SimpleRasterDto = new SimpleRasterDto(simpleRasterDto.id, simpleRasterDto.type, simpleRasterDto.center, simpleRasterDto.isGrouped,
            simpleRasterDto.parentEdtGroupId, simpleRasterDto.width, simpleRasterDto.height,
            simpleRasterDto.borderColor, simpleRasterDto.borderWidth, simpleRasterDto.fillColor,
            simpleRasterDto.opacity, simpleRasterDto.linkPortsDto, null);

          deleteList.splice(idx, 1);
          deleteList.splice(idx, 0, newSimpleRasterDto);
        }
      }

      let packetDto = this.websocketManager.createWbSessionScopePacket(deleteList,WebsocketPacketActionEnum.DELETE);
      packetDto.wsPacketSeq = this.websocketManager.wsPacketSeq;

      this.socket.emit(HttpHelper.websocketApi.whiteboardItem.delete_multiple.event, packetDto);

      //#### 요청 완료

      this.socket.once(HttpHelper.websocketApi.whiteboardItem.delete_multiple.event,
        (wsPacketDto:WebsocketPacketDto)=>{
          //this.websocketManager.uiService.spin$.next(false);
          switch (wsPacketDto.action) {
            case WebsocketPacketActionEnum.ACK:
              // console.log("WsWhiteboardController >> waitRequestDeleteWbItem >> wsPacketDto : ",wsPacketDto);
              subscriber.next(wsPacketDto);
              break;
            case WebsocketPacketActionEnum.NAK:
              subscriber.error(wsPacketDto);
              break;
          }
        })
    });
  }

  private onMultipleWbItemDeleted(){
    this.socket.on(HttpHelper.websocketApi.whiteboardItem.delete_multiple.event,
      (wsPacketDto:WebsocketPacketDto)=>{
        if (wsPacketDto.action === WebsocketPacketActionEnum.DELETE) {
          // console.log("WsWhiteboardController >> onWbItemDeleted >> wsPacketDto : ",wsPacketDto);

          this.websocketManager.wbItemEventManagerService.wsWbItemEventEmitter.emit(
            new WbItemEvent( WbItemEventEnum.DELETE_MULTIPLE, wsPacketDto.dataDto, wsPacketDto.additionalData)
          );

        }
      });
  }
  /* **************************************************** */
  /* Request Delete Multiple END */
  /* **************************************************** */


  /* *************************************************** */
  /* Request Lock START */
  /* *************************************************** */
  waitRequestLockWbItem( wbItemDto:WhiteboardItemDto ){

    //this.websocketManager.uiService.spin$.next(true);

    return new Observable<any>((subscriber)=>{

      let packetDto = this.websocketManager.createWbSessionScopePacket(wbItemDto,WebsocketPacketActionEnum.LOCK);
      packetDto.wsPacketSeq = this.websocketManager.wsPacketSeq;

      this.socket.emit(HttpHelper.websocketApi.whiteboardItem.lock.event, packetDto);

      //#### 요청 완료

      this.socket.once(HttpHelper.websocketApi.whiteboardItem.lock.event,
        (wsPacketDto:WebsocketPacketDto)=>{
          //this.websocketManager.uiService.spin$.next(false);
          switch (wsPacketDto.action) {
            case WebsocketPacketActionEnum.ACK:
              subscriber.next(wsPacketDto);
              break;
            case WebsocketPacketActionEnum.NAK:
              subscriber.error(wsPacketDto);
              break;
          }
        })
    });
  }

  private onWbItemLocked(){
    this.socket.on(HttpHelper.websocketApi.whiteboardItem.lock.event,
      (wsPacketDto:WebsocketPacketDto)=>{
        if (wsPacketDto.action === WebsocketPacketActionEnum.LOCK) {
          // console.log("WsWhiteboardController >> onWbItemLocked >> wsPacketDto : ",wsPacketDto);

          this.websocketManager.wbItemEventManagerService.wsWbItemEventEmitter.emit(
            new WbItemEvent( WbItemEventEnum.UPDATE, wsPacketDto.dataDto as WhiteboardItemDto)
          );

        }
      });
  }
  /* **************************************************** */
  /* Request Lock END */
  /* **************************************************** */

  /* *************************************************** */
  /* Request Unlock START */
  /* *************************************************** */
  waitRequestUnlockWbItem( wbItemDto:WhiteboardItemDto ){

    //this.websocketManager.uiService.spin$.next(true);

    return new Observable<any>((subscriber)=>{

      let packetDto = this.websocketManager.createWbSessionScopePacket(wbItemDto,WebsocketPacketActionEnum.UNLOCK);
      packetDto.wsPacketSeq = this.websocketManager.wsPacketSeq;

      this.socket.emit(HttpHelper.websocketApi.whiteboardItem.unlock.event, packetDto);

      //#### 요청 완료

      this.socket.once(HttpHelper.websocketApi.whiteboardItem.unlock.event,
        (wsPacketDto:WebsocketPacketDto)=>{
          //this.websocketManager.uiService.spin$.next(false);
          switch (wsPacketDto.action) {
            case WebsocketPacketActionEnum.ACK:
              // console.log("WsWhiteboardController >> waitRequestUnlockWbItem >> wsPacketDto : ",wsPacketDto);
              subscriber.next(wsPacketDto);
              break;
            case WebsocketPacketActionEnum.NAK:
              subscriber.error(wsPacketDto);
              break;
          }
        })
    });
  }

  private onWbItemUnlocked(){
    this.socket.on(HttpHelper.websocketApi.whiteboardItem.unlock.event,
      (wsPacketDto:WebsocketPacketDto)=>{
        if (wsPacketDto.action === WebsocketPacketActionEnum.UNLOCK) {
          // console.log("WsWhiteboardController >> onWbItemUnlocked >> wsPacketDto : ",wsPacketDto);

          this.websocketManager.wbItemEventManagerService.wsWbItemEventEmitter.emit(
            new WbItemEvent( WbItemEventEnum.UPDATE, wsPacketDto.dataDto as WhiteboardItemDto)
          );

        }
      });
  }
  /* **************************************************** */
  /* Request Unlock END */
  /* **************************************************** */

  /* *************************************************** */
  /* Request Occupied START */
  /* *************************************************** */
  waitRequestOccupyWbItem( gsgDto:GlobalSelectedGroupDto ){

    //this.websocketManager.uiService.spin$.next(true);

    return new Observable<any>((subscriber)=>{
      this.setGsgDto(gsgDto);

      let packetDto = this.websocketManager.createWbSessionScopePacket(gsgDto,WebsocketPacketActionEnum.OCCUPIED);
      packetDto.wsPacketSeq = this.websocketManager.wsPacketSeq;

      this.socket.emit(HttpHelper.websocketApi.whiteboardItem.occupied.event, packetDto);

      //#### 요청 완료

      this.socket.once(HttpHelper.websocketApi.whiteboardItem.occupied.event,
        (wsPacketDto:WebsocketPacketDto)=>{
          //this.websocketManager.uiService.spin$.next(false);
          // console.log("WsWhiteboardController >> waitRequestOccupyWbItem >> wsPacketDto : ",wsPacketDto);
          switch (wsPacketDto.action) {
            case WebsocketPacketActionEnum.ACK:
              subscriber.next(wsPacketDto);
              break;
            case WebsocketPacketActionEnum.NAK:
              subscriber.error(wsPacketDto);
              break;
          }
        })
    });
  }

  private onWbItemOccupied(){
    this.socket.on(HttpHelper.websocketApi.whiteboardItem.occupied.event,
      (wsPacketDto:WebsocketPacketDto)=>{
        if (wsPacketDto.action === WebsocketPacketActionEnum.OCCUPIED) {
          // console.log("WsWhiteboardController >> onWbItemOccupied >> wsPacketDto : ",wsPacketDto);

          this.websocketManager.wbItemEventManagerService.wsWbItemEventEmitter.emit(
            new WbItemEvent( WbItemEventEnum.OCCUPIED, wsPacketDto.dataDto as WhiteboardItemDto, wsPacketDto)
          );

        }
      });
  }
  /* **************************************************** */
  /* Request Occupied END */
  /* **************************************************** */

  /* *************************************************** */
  /* Request Not Occupied START */
  /* *************************************************** */
  waitRequestNotOccupyWbItem( gsgDto:GlobalSelectedGroupDto ){

    //this.websocketManager.uiService.spin$.next(true);

    return new Observable<any>((subscriber)=>{

      this.setGsgDto(gsgDto);

      let packetDto = this.websocketManager.createWbSessionScopePacket(gsgDto,WebsocketPacketActionEnum.NOT_OCCUPIED);
      packetDto.wsPacketSeq = this.websocketManager.wsPacketSeq;
      // console.log("WsWhiteboardController >> waitRequestNotOccupyWbItem >> gsgDto : ",gsgDto);
      this.socket.emit(HttpHelper.websocketApi.whiteboardItem.notOccupied.event, packetDto);

      //#### 요청 완료

      this.socket.once(HttpHelper.websocketApi.whiteboardItem.notOccupied.event,
        (wsPacketDto:WebsocketPacketDto)=>{
          //this.websocketManager.uiService.spin$.next(false);
          switch (wsPacketDto.action) {
            case WebsocketPacketActionEnum.ACK:
              // console.log("WsWhiteboardController >> waitRequestNotOccupyWbItem >> wsPacketDto : ",wsPacketDto);
              subscriber.next(wsPacketDto);
              break;
            case WebsocketPacketActionEnum.NAK:
              subscriber.error(wsPacketDto);
              break;
          }
        })
    });
  }

  private onWbItemNotOccupied(){
    this.socket.on(HttpHelper.websocketApi.whiteboardItem.notOccupied.event,
      (wsPacketDto:WebsocketPacketDto)=>{
        if (wsPacketDto.action === WebsocketPacketActionEnum.NOT_OCCUPIED) {
          // console.log("WsWhiteboardController >> onWbItemNotOccupied >> wsPacketDto : ",wsPacketDto);

          this.websocketManager.wbItemEventManagerService.wsWbItemEventEmitter.emit(
            new WbItemEvent( WbItemEventEnum.NOT_OCCUPIED, wsPacketDto.dataDto as WhiteboardItemDto)
          );

        }
      });
  }
  /* **************************************************** */
  /* Request Not Occupied END */
  /* **************************************************** */


  private setGsgDto(gsgDto:GlobalSelectedGroupDto){
    if(gsgDto){
      gsgDto.userIdToken = this.websocketManager.userInfo.idToken;
      gsgDto.userName = this.websocketManager.userInfo.userName;
    }
  }

  public static initInstance(websocketManager){
    WsWhiteboardController.instance = new WsWhiteboardController(websocketManager);
  }

  public static getInstance(){
    if(WsWhiteboardController.instance){
      return WsWhiteboardController.instance;
    }
    else{
      console.warn("경고! 싱글톤 클래스를 초기화 하지 않은 채로 인스턴스에 접근하려는 시도 식별됨!!!");
      return null;
    }
  }

  public getUserNameWithIdToken(idToken){
    return this.websocketManager.getUserInfoByIdToken(idToken)
  }

}
