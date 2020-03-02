import {EventEmitter} from '@angular/core';
import {ItemLifeCycleEnum} from '../../../Whiteboard-Item/WhiteboardItemLifeCycle/WhiteboardItemLifeCycle';
import {WbItemWork} from './WbItemWork/wb-item-work';
import {DrawingLayerManagerService} from '../drawing-layer-manager.service';
import {WhiteboardItemFactory} from '../../WhiteboardItemFactory/whiteboard-item-factory';
import {WhiteboardItemDto} from '../../../../../DTO/WhiteboardItemDto/whiteboard-item-dto';
import {WsWhiteboardController} from '../../../../../Controller/Controller-WebSocket/websocket-manager/WhiteboardWsController/ws-whiteboard.controller';
import {WhiteboardItem} from '../../../Whiteboard-Item/whiteboard-item';
import {WebsocketPacketDto} from '../../../../../DTO/WebsocketPacketDto/WebsocketPacketDto';

export class WorkHistoryManager {

  //lce2 = WbItem Life Cycle Event Emitter
  private lce2:EventEmitter<any>;
  private layerService:DrawingLayerManagerService;
  private static myInstance:WorkHistoryManager = null;

  public isProcessing = false;

  //public dataCurrentArray: Array<WbItemWork> = [];

  public undoStack: Array<WbItemWork> = [];
  public redoStack: Array<WbItemWork> = [];

  undoLimit: number = 35;

  private constructor(layerService:DrawingLayerManagerService){
    console.log("WorkHistoryManager >> constructor >> 진입함");
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
    console.log("WorkHistoryManager >> verifyTask >> 진입함");
    if(!wbItemWork){
      return false;
    }
    switch (wbItemWork.action) {
      case ItemLifeCycleEnum.CREATE:
      case ItemLifeCycleEnum.MODIFY:
        for(let wbItemDto of wbItemWork.wbItemDtoArray){
          if(!this.layerService.findItemById(wbItemDto.id)){
            console.log("WorkHistoryManager >> verifyTask >> invalid wbItem : ",wbItemDto);
            return false;
          }
        }
    }
    return true;
  }
  private removeTaskByTaskObject(willBeDeletedTask:WbItemWork){
    console.log("WorkHistoryManager >> removeTaskByTaskObject >> willBeDeletedTask : ",willBeDeletedTask);

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

      console.log("WorkHistoryManager >> doUndoAction >> currentAction : ",currentAction);

      switch (currentAction.action) {
        case ItemLifeCycleEnum.CREATE:
          this.destroyItem(currentAction.wbItemDtoArray).then(()=>{
            resolve();
          });
          break;
        case ItemLifeCycleEnum.MODIFY:
          //해당 WbItemWork의 DTO대로 update 수행
          this.updateItem(currentAction.wbItemDtoArray).then(()=>{
            resolve();
          });
          break;
        case ItemLifeCycleEnum.DESTROY:
          this.buildItem(currentAction.wbItemDtoArray).then((recvWbItemDtoArray)=>{
            console.log("WorkHistoryManager >> buildItem >> promise return >> recvWbItemDtoArray : ",recvWbItemDtoArray);
            // currentAction.wbItemDtoArray = recvWbItemDtoArray;
            currentAction.wbItemDtoArray.splice(0, currentAction.wbItemDtoArray.length);
            for(let recvWbItemDto of recvWbItemDtoArray){
              currentAction.wbItemDtoArray.push(recvWbItemDto);
            }
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

      WhiteboardItemFactory.cloneWbItems(originWbItemDtoArray)
        .subscribe((copiedItems:Array<WhiteboardItem>)=>{

          let copiedItemDtoArray:Array<WhiteboardItemDto> = new Array<WhiteboardItemDto>();

          for (let i = 0; i < copiedItems.length; i++) {
            let newWbItem = copiedItems[i];
            copiedItemDtoArray.push(newWbItem.exportToDto());
          }

          wsWbController.waitRequestCreateMultipleWbItem(copiedItemDtoArray)
            .subscribe((wsPacketDto:WebsocketPacketDto)=>{
              let recvWbItemDtoArray:Array<WhiteboardItemDto> = wsPacketDto.dataDto as Array<WhiteboardItemDto>;

              for (let i = 0; i < copiedItems.length; i++) {
                let originKey = originWbItemDtoArray[i].id;
                let newKey = recvWbItemDtoArray[i].id;

                let newWbItem = copiedItems[i];
                newWbItem.id = newKey;
                newWbItem.group.opacity = 1;
                newWbItem.coreItem.opacity = 1;

                console.log("WorkHistoryManager >> buildItem >> originKey : ",originKey);
                console.log("WorkHistoryManager >>  >> newKey : ",newKey);

                for(let task of this.undoStack){
                  for(let wbItemDto of task.wbItemDtoArray){
                    if(wbItemDto.id === originKey){
                      wbItemDto.id = newKey;
                    }
                  }
                }
                for(let task of this.redoStack){
                  for(let wbItemDto of task.wbItemDtoArray){
                    if(wbItemDto.id === originKey){
                      wbItemDto.id = newKey;
                    }
                  }
                }

              }
              resolve(recvWbItemDtoArray);
            });
        });
    });
  }
  async updateItem(wbItemDtoArray:Array<WhiteboardItemDto>):Promise<any>{
    return new Promise<any>((resolve, reject)=>{
      let wsWbController = WsWhiteboardController.getInstance();

      for(let currDto of wbItemDtoArray){
        let updateItem = this.layerService.findItemById(currDto.id);
        if(updateItem){
          //this.layerService.deleteItemFromWbArray(delItem.id);
          updateItem.update(currDto);
          wsWbController.waitRequestUpdateWbItem(currDto).subscribe(()=>{
            resolve();
          });
        }
      }
    });
  }
  async destroyItem(wbItemDtoArray:Array<WhiteboardItemDto>):Promise<any>{
    return new Promise<any>((resolve, reject)=>{
      let wsWbController = WsWhiteboardController.getInstance();

      for(let currDto of wbItemDtoArray){
        let delItem = this.layerService.findItemById(currDto.id);

        if(delItem){
          delItem.destroyItem();
          wsWbController.waitRequestDeleteWbItem(currDto).subscribe(()=>{
            resolve();
          });
        }
      }
    });
  }

  public pushIntoStack(wbItemWork:WbItemWork){
    this.redoStack.splice(0, this.redoStack.length);
    this.undoStack.push(wbItemWork);
  }
  private undo(){
    let poppedTask:WbItemWork = this.undoStack.pop();

    if(!poppedTask){
      return;
    }
    let duplicatedTask = poppedTask.clone();
    this.redoStack.push(this.revertTask(duplicatedTask));
    return poppedTask;
  }

  private redo(){
    let poppedTask:WbItemWork = this.redoStack.pop();

    if(!poppedTask){
      return;
    }
    let duplicatedTask = poppedTask.clone();
    this.undoStack.push(this.revertTask(duplicatedTask));
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
    console.log("WorkHistoryManager >> initInstance >> 진입함");
    if(!WorkHistoryManager.myInstance){
      WorkHistoryManager.myInstance = new WorkHistoryManager(layerService);
    }
    return this.myInstance;
  }

  public static getInstance(){
    return this.myInstance;
  }

}
