import {EventEmitter} from '@angular/core';
import {ItemLifeCycleEnum} from '../../../Whiteboard-Item/WhiteboardItemLifeCycle/WhiteboardItemLifeCycle';
import {WbItemWork} from './WbItemWork/wb-item-work';
import {DrawingLayerManagerService} from '../drawing-layer-manager.service';
import {WhiteboardItemFactory} from '../../WhiteboardItemFactory/whiteboard-item-factory';
import {WhiteboardItemDto} from '../../../../../DTO/WhiteboardItemDto/whiteboard-item-dto';
import {WsWhiteboardController} from '../../../../../Controller/Controller-WebSocket/websocket-manager/WhiteboardWsController/ws-whiteboard.controller';
import {WhiteboardItem} from '../../../Whiteboard-Item/whiteboard-item';
import {WebsocketPacketDto} from '../../../../../DTO/WebsocketPacketDto/WebsocketPacketDto';
import {WhiteboardItemType} from '../../../../Helper/data-type-enum/data-type.enum';
import {EditableLinkDto} from '../../../../../DTO/WhiteboardItemDto/WhiteboardShapeDto/LinkPortDto/EditableLinkDto/editable-link-dto';
import {EditableLink} from '../../../Whiteboard-Item/Whiteboard-Shape/LinkPort/EditableLink/editable-link';
import {WhiteboardShape} from '../../../Whiteboard-Item/Whiteboard-Shape/whiteboard-shape';
import {LinkPortDto} from '../../../../../DTO/WhiteboardItemDto/WhiteboardShapeDto/LinkPortDto/link-port-dto';

export class WorkHistoryManager {

  private lce2:EventEmitter<any>;
  private layerService:DrawingLayerManagerService;
  private static myInstance:WorkHistoryManager = null;

  public isProcessing = false;


  public undoStack: Array<WbItemWork> = [];
  public redoStack: Array<WbItemWork> = [];

  undoLimit: number = 35;

  private constructor(layerService:DrawingLayerManagerService){
    this.lce2 = layerService.globalLifeCycleEmitter;
    this.layerService = layerService;
  }


  public redoTask(){
    if(this.isProcessing){
      return;
    }
    if(this.redoStack.length <= 0){
      return;
    }
    this.isProcessing = true;
    let poppedTask = this.redo();

    if(!this.verifyTask(poppedTask)){
      //시퀀스 중단, 수행할 수 없는 태스크와 조우
      this.undoStack.pop();
      this.isProcessing = false;
    }

    if(poppedTask){
      this.doAction(poppedTask).then(()=>{
        this.isProcessing = false;
      }).catch((e)=>{
      });
    }else {
      this.isProcessing = false;
    }
  }
  public undoTask(){
    if(this.isProcessing){
      return;
    }
    if(this.undoStack.length <= 0){
      return;
    }
    this.isProcessing = true;
    let poppedTask = this.undo();

    if(!this.verifyTask(poppedTask)){
      //시퀀스 중단, 수행할 수 없는 태스크와 조우
      this.redoStack.pop();
      this.isProcessing = false;
    }

    if(poppedTask){
      this.doAction(poppedTask).then(()=>{
        this.isProcessing = false;
      });
    }else {
      this.isProcessing = false;
    }
  }
  verifyTask(wbItemWork:WbItemWork){
    if(!wbItemWork){
      return false;
    }
    switch (wbItemWork.action) {
      case ItemLifeCycleEnum.CREATE:
      case ItemLifeCycleEnum.MODIFY:
        for(let wbItemDto of wbItemWork.wbItemDtoArray){
          if(!this.layerService.findItemById(wbItemDto.id)){
            return false;
          }
        }
    }
    return true;
  }
  private removeTaskByTaskObject(willBeDeletedTask:WbItemWork){

    for (let i = 0; i < this.redoStack.length; i++) {
      let currTask = this.redoStack[i];
      if(currTask.id === willBeDeletedTask.id){
        this.redoStack.splice(i, 1);
        break;
      }
    }
    for (let i = 0; i < this.undoStack.length; i++) {
      let currTask = this.undoStack[i];
      if(currTask.id === willBeDeletedTask.id){
        this.undoStack.splice(i, 1);
        break;
      }
    }

  }
  public removeTask(wbItemId){

    let i = this.undoStack.length;
    while (i--) {
      let currTask = this.undoStack[i];

      for(let wbItemDto of currTask.wbItemDtoArray){
        if(wbItemDto.id === wbItemId){
          this.undoStack.splice(i, 1);
          break;
        }
      }
    }

    i = this.redoStack.length;
    while (i--) {
      let currTask = this.redoStack[i];

      for(let wbItemDto of currTask.wbItemDtoArray){
        if(wbItemDto.id === wbItemId){
          this.redoStack.splice(i, 1);
          break;
        }
      }
    }

  }

  async doAction(currentAction:WbItemWork) :Promise<any>{
    return new Promise<any>((resolve, reject)=>{

      switch (currentAction.action) {
        case ItemLifeCycleEnum.CREATE:
          this.destroyItem(currentAction.wbItemDtoArray).then(()=>{
            this.layerService.minimapSyncService.syncMinimap();
            this.layerService.globalSelectedGroup.refreshGsg();
            this.layerService.horizonContextMenuService.close();
            resolve();
          });
          break;
        case ItemLifeCycleEnum.MODIFY:
          //해당 WbItemWork의 DTO대로 update 수행
          this.updateItem(currentAction.wbItemDtoArray).then(()=>{
            this.layerService.minimapSyncService.syncMinimap();
            this.layerService.globalSelectedGroup.refreshGsg();
            resolve();
          });
          break;
        case ItemLifeCycleEnum.DESTROY:
          this.buildItem(currentAction.wbItemDtoArray).then(()=>{
            this.layerService.minimapSyncService.syncMinimap();
            resolve();
          });
          break;
        case ItemLifeCycleEnum.COPIED:
          //DTO에 대응하는 WbItem을 전부 삭제
          break;
      }

    });
  }

  async buildItem(originWbItemDtoArray:Array<WhiteboardItemDto>):Promise<Array<WhiteboardItemDto>>{
    return new Promise<any>((resolve, reject)=>{
      let wsWbController = WsWhiteboardController.getInstance();
      console.log("WorkHistoryManager >>  >> originWbItemDtoArray : ",originWbItemDtoArray);

      WhiteboardItemFactory.cloneWbItems(originWbItemDtoArray)
        .subscribe((copiedItems:Array<WhiteboardItem>)=>{

          let copiedItemDtoArray:Array<WhiteboardItemDto> = new Array<WhiteboardItemDto>();

          for (let i = 0; i < copiedItems.length; i++) {
            let newWbItem = copiedItems[i];
            let newWbItemDto = newWbItem.exportToDto();

            let originWbItemDto = originWbItemDtoArray[i];

            if(newWbItem.type === WhiteboardItemType.EDITABLE_LINK
              && originWbItemDto.type  === WhiteboardItemType.EDITABLE_LINK){
              let newWbLinkDto:EditableLinkDto = newWbItemDto as EditableLinkDto;
              let originWbLinkDto:EditableLinkDto = originWbItemDto as EditableLinkDto;


              newWbLinkDto.fromLinkPort = originWbLinkDto.fromLinkPort;
              newWbLinkDto.toLinkPort = originWbLinkDto.toLinkPort;
            }
            copiedItemDtoArray.push(newWbItem.exportToDto());

          }

          wsWbController.waitRequestCreateMultipleWbItem(copiedItemDtoArray)
            .subscribe((wsPacketDto:WebsocketPacketDto)=>{
              let recvWbItemDtoArray:Array<WhiteboardItemDto> = wsPacketDto.dataDto as Array<WhiteboardItemDto>;

              let createdWbItemMap:Map<any,any> = new Map<any, any>();

              for (let i = 0; i < copiedItems.length; i++) {
                let originKey = originWbItemDtoArray[i].id;
                let newKey = recvWbItemDtoArray[i].id;

                let newWbItem = copiedItems[i];
                newWbItem.id = newKey;
                newWbItem.zIndex = recvWbItemDtoArray[i].zIndex;
                newWbItem.group.opacity = 1;
                newWbItem.coreItem.opacity = 1;
                createdWbItemMap.set(newWbItem.id, newWbItem);
                this.updateIdMap(originKey, newKey);
              }
              for(let i = 0 ; i < originWbItemDtoArray.length; i++){
                let currOriginWbItemDto = originWbItemDtoArray[i];
                if(currOriginWbItemDto.type === WhiteboardItemType.EDITABLE_LINK){
                  let edtLinkItemDto:EditableLinkDto = currOriginWbItemDto as EditableLinkDto;
                  let edtLinkItem:EditableLink = createdWbItemMap.get(edtLinkItemDto.id);
                  if(edtLinkItem){

                    //1. dto엔 from이 있는데 item엔 없는 경우
                    if(edtLinkItemDto.fromLinkPort && !edtLinkItem.fromLinkPort){
                      let foundWbShape:WhiteboardShape = this.layerService.findItemById(edtLinkItemDto.fromLinkPort.ownerWbItemId) as WhiteboardShape;
                      let foundLinkPort;
                      if(foundWbShape){
                        foundLinkPort = foundWbShape.linkPortMap.get(edtLinkItemDto.fromLinkPort.direction);
                      }

                      if (foundLinkPort) {
                        edtLinkItem.fromLinkPort = foundLinkPort;
                      }
                    }
                    //2. dto엔 to가 있는데 item엔 없는 경우
                    if(edtLinkItemDto.toLinkPort && !edtLinkItem.toLinkPort){
                      let foundWbShape:WhiteboardShape = this.layerService.findItemById(edtLinkItemDto.toLinkPort.ownerWbItemId) as WhiteboardShape;

                      let foundLinkPort;
                      if (foundWbShape) {
                        foundLinkPort = foundWbShape.linkPortMap.get(edtLinkItemDto.toLinkPort.direction);
                      }
                      if(foundLinkPort){
                        edtLinkItem.toLinkPort = foundLinkPort;
                      }
                    }
                  }
                }
              }
              let resolveCounter = copiedItems.length;
              let copiedItemDtoList:Array<WhiteboardItemDto> = new Array<WhiteboardItemDto>();

              for(let copiedItem of copiedItems){
                copiedItemDtoList.push(copiedItem.exportToDto());
              }

              wsWbController.waitRequestUpdateMultipleWbItem(copiedItemDtoList).subscribe(()=>{
                resolve();
              });

            });
        });
    });
  }
  async updateItem(wbItemDtoArray:Array<WhiteboardItemDto>):Promise<any>{
    return new Promise<any>((resolve, reject)=>{
      let i = wbItemDtoArray.length;
      while (i--) {
        let currDto = wbItemDtoArray[i];
        let updateItem = this.layerService.findItemById(currDto.id);
        if(updateItem){
          updateItem.update(currDto);
        }else{
          wbItemDtoArray.splice(i, 1);
        }
      }
      let wsWbController = WsWhiteboardController.getInstance();
      wsWbController.waitRequestUpdateMultipleWbItem(wbItemDtoArray).subscribe(()=>{
        resolve();
      });
    });
  }
  async destroyItem(wbItemDtoArray:Array<WhiteboardItemDto>):Promise<any>{
    return new Promise<any>((resolve, reject)=>{
      let wsWbController = WsWhiteboardController.getInstance();

      for(let currDto of wbItemDtoArray){
        let delItem = this.layerService.findItemById(currDto.id);

        if(delItem){
          delItem.destroyItemAndNoEmit();
          /*wsWbController.waitRequestDeleteWbItem(currDto).subscribe(()=>{
            resolve();
          });*/
        }
      }
      wsWbController.waitRequestDeleteMultipleWbItem(wbItemDtoArray).subscribe(()=>{
        resolve();
      });
    });
  }

  public idMap:Map<any, Array<any>> = new Map<any, Array<any>>();

  addIdIntoIdMap(wbItemWork:WbItemWork){
    for(let currWbItemDto of wbItemWork.wbItemDtoArray){
      this.addIdProcess(currWbItemDto);

      if(currWbItemDto.type === WhiteboardItemType.EDITABLE_LINK){
        let linkDto:EditableLinkDto = currWbItemDto as EditableLinkDto;
        if(linkDto.fromLinkPort){
          this.addIdProcess(linkDto.fromLinkPort);
        }
        if(linkDto.toLinkPort){
          this.addIdProcess(linkDto.toLinkPort);
        }
      }
    }
  }
  updateIdMap(oldId, newId){
    if (this.idMap.has(oldId)) {
      let valueOfIdMap = this.idMap.get(oldId);
      for(let currValue of valueOfIdMap){

        if(currValue instanceof WhiteboardItemDto){
          if (currValue.type === WhiteboardItemType.EDITABLE_LINK) {
            let edtLinkDto:EditableLinkDto = currValue as EditableLinkDto;
            if(edtLinkDto.id === oldId){
              edtLinkDto.id = newId;
            }else if(edtLinkDto.fromLinkPort && edtLinkDto.fromLinkPort.ownerWbItemId === oldId){
              edtLinkDto.fromLinkPort.ownerWbItemId = newId;
            }else if (edtLinkDto.toLinkPort && edtLinkDto.toLinkPort.ownerWbItemId === oldId){
              edtLinkDto.toLinkPort.ownerWbItemId = newId;
            }
          }
          else{
            currValue.id = newId;
          }
        }

      }
      this.idMap.set(newId, valueOfIdMap);
      this.idMap.delete(oldId);
    }
  }
  addIdProcess(itemDto){
    this.pushIdIntoIdMap(itemDto.id, itemDto);

    if(itemDto.type === WhiteboardItemType.EDITABLE_LINK){
      let linkItemDto:EditableLinkDto = itemDto as EditableLinkDto;
      if(linkItemDto.fromLinkPort){
        this.pushIdIntoIdMap(linkItemDto.fromLinkPort.ownerWbItemId, itemDto);
      }
      if(linkItemDto.toLinkPort){
        this.pushIdIntoIdMap(linkItemDto.toLinkPort.ownerWbItemId, itemDto);
      }
    }
  }
  private pushIdIntoIdMap(id, itemDto){
    if (!this.idMap.has(id)) {
      this.idMap.set(id, new Array<any>());
    }

    let idMapValue = this.idMap.get(id);
    idMapValue.push(itemDto);
  }

  public pushIntoStack(wbItemWork:WbItemWork){
    this.redoStack.splice(0, this.redoStack.length);
    this.undoStack.push(wbItemWork);
    this.addIdIntoIdMap(wbItemWork);
  }
  private undo(){
    let poppedTask:WbItemWork = this.undoStack.pop();

    if(!poppedTask){
      return;
    }
    let duplicatedTask = poppedTask.clone();
    this.redoStack.push(this.revertTask(duplicatedTask));
    this.addIdIntoIdMap(duplicatedTask);
    return poppedTask;
  }

  private redo(){
    let poppedTask:WbItemWork = this.redoStack.pop();

    if(!poppedTask){
      return;
    }
    let duplicatedTask = poppedTask.clone();
    this.undoStack.push(this.revertTask(duplicatedTask));
    this.addIdIntoIdMap(duplicatedTask);
    return poppedTask;
  }

  revertTask(wbItemWork:WbItemWork){
    switch (wbItemWork.action) {
      case ItemLifeCycleEnum.CREATE:
        wbItemWork.action = ItemLifeCycleEnum.DESTROY;
        break;
      case ItemLifeCycleEnum.MODIFY:
        let newWbItemDtoArray:Array<WhiteboardItemDto> = new Array<WhiteboardItemDto>();
        for(let currDto of wbItemWork.wbItemDtoArray){
          let updateItem = this.layerService.findItemById(currDto.id);
          if(updateItem){
            newWbItemDtoArray.push(updateItem.exportToDto());
          }
        }
        wbItemWork.wbItemDtoArray = newWbItemDtoArray;
        break;
      case ItemLifeCycleEnum.DESTROY:
        wbItemWork.action = ItemLifeCycleEnum.CREATE;
        break;
    }
    return wbItemWork;
  }

  // ##### Initialize #####
  public static initInstance(layerService:DrawingLayerManagerService){
    if(!WorkHistoryManager.myInstance){
      WorkHistoryManager.myInstance = new WorkHistoryManager(layerService);
    }
    return this.myInstance;
  }

  public static getInstance(){
    return this.myInstance;
  }

}
