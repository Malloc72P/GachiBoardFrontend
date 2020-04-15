import * as paper from 'paper';

import {ItemGroup} from '../item-group';
import {WhiteboardItemType} from '../../../../Helper/data-type-enum/data-type.enum';
import {SelectModeEnum} from '../../../InfiniteCanvas/DrawingLayerManager/SelectModeEnum/select-mode-enum.enum';
import {WhiteboardItem} from '../../whiteboard-item';
import {WhiteboardShape} from '../../Whiteboard-Shape/whiteboard-shape';
import {WhiteboardItemDto} from '../../../../../DTO/WhiteboardItemDto/whiteboard-item-dto';
import {WhiteboardItemFactory} from '../../../InfiniteCanvas/WhiteboardItemFactory/whiteboard-item-factory';
import {Observable} from 'rxjs';
import {EditableLink} from '../../Whiteboard-Shape/LinkPort/EditableLink/editable-link';
import {WsWhiteboardController} from '../../../../../Controller/Controller-WebSocket/websocket-manager/WhiteboardWsController/ws-whiteboard.controller';
import {WebsocketPacketDto} from '../../../../../DTO/WebsocketPacketDto/WebsocketPacketDto';
import {EventEmitter} from '@angular/core';
import {GsgSelectEvent, GsgSelectEventEnum} from './GsgSelectEvent/GsgSelectEvent';
import {ItemLifeCycleEnum, ItemLifeCycleEvent} from '../../WhiteboardItemLifeCycle/WhiteboardItemLifeCycle';
import {WbItemPacketDto} from '../../../../../DTO/WhiteboardItemDto/WbItemPacketDto/WbItemPacketDto';
import {ParticipantDto} from '../../../../../DTO/ProjectDto/ParticipantDto/participant-dto';
import {WorkHistoryManager} from '../../../InfiniteCanvas/DrawingLayerManager/WorkHistoryManager/work-history-manager';
import {WbItemWork} from '../../../InfiniteCanvas/DrawingLayerManager/WorkHistoryManager/WbItemWork/wb-item-work';
import {GlobalSelectedGroupDto} from '../../../../../DTO/WhiteboardItemDto/ItemGroupDto/GlobalSelectedGroupDto/GlobalSelectedGroupDto';
import {GachiPointDto} from '../../../../../DTO/WhiteboardItemDto/PointDto/gachi-point-dto';
// @ts-ignore
import Item = paper.Item;
// @ts-ignore
import Path = paper.Path;

export class GlobalSelectedGroup extends ItemGroup {
  private static globalSelectedGroup: GlobalSelectedGroup;
  private prevMode;
  private prevNumberOfChild;

  private copiedDtoArray:Array<WhiteboardItemDto>;

  private _isLinkSelected = false;

  public gsgSelectorEventEmitter:EventEmitter<any>;

  private constructor(id, type, item: Item, layerService) {
    super(id, type, item, layerService);
    this.prevMode = SelectModeEnum.SINGLE_SELECT;
    this.prevNumberOfChild = this.getNumberOfChild();
    this.copiedDtoArray = new Array<WhiteboardItemDto>();

    this.gsgSelectorEventEmitter = new EventEmitter<any>();

    this.gsgSelectorEventEmitter.subscribe((gsgEvent:GsgSelectEvent)=>{
      let wsWbController = WsWhiteboardController.getInstance();

      switch (gsgEvent.action) {
        case GsgSelectEventEnum.SELECTED:

          // this.applyZIndexToSelection();

          wsWbController.waitRequestOccupyWbItem(this.exportToGsgDto())
            .subscribe(()=>{

            },(errorParam:WebsocketPacketDto)=>{
              this.extractOneFromGroup(gsgEvent.wbItem);
              let recvWbItemDto:WbItemPacketDto = errorParam.additionalData as WbItemPacketDto;
              if (recvWbItemDto) {
                let occupierInfo: ParticipantDto = wsWbController.getUserNameWithIdToken(recvWbItemDto.occupiedBy);
                gsgEvent.wbItem.onOccupied(occupierInfo.userName);
              }
            });
          break;
        case GsgSelectEventEnum.DESELECTED:
          wsWbController.waitRequestNotOccupyWbItem(this.exportToGsgDto())
            .subscribe((error)=>{
            });
          break;
      }
    });
    this.setLifeCycleEvent();
    this.localEmitCreate();
    this.globalEmitCreate();

  }

  moveEnd() {
    let isMoved = super.moveEnd();
    if (isMoved) {
      this.pushGsgWorkIntoWorkHistroy(ItemLifeCycleEnum.MODIFY);
      this.requestUpdateOnSelectedItem();
      // this.applyZIndexToSelection();
    }
    return true;
  }
  resizeEnd() {
    super.resizeEnd();
    this.pushGsgWorkIntoWorkHistroy(ItemLifeCycleEnum.MODIFY);
    this.requestUpdateOnSelectedItem();
  }

  applyZIndexToSelection(){
    this.layerService.applyZIndex();
  }

  requestUpdateOnSelectedItem(){
    let wsWbController = WsWhiteboardController.getInstance();
    wsWbController.waitRequestUpdateMultipleWbItem(this.exportSelectionToDto(), this.exportToGsgDto()).subscribe(()=>{});
  }


  public prevItemState:Array<WhiteboardItemDto> = new Array<WhiteboardItemDto>();
  saveCurrentItemState(){

    this.prevItemState = new Array<WhiteboardItemDto>();

    for(let wbItem of this.wbItemGroup){
      this.prevItemState.push(wbItem.exportToDto());
    }

  }

  pushGsgWorkIntoWorkHistroy(action:ItemLifeCycleEnum){

    if(this.prevItemState.length <= 0){
      return;
    }
    let workHistoryManager = WorkHistoryManager.getInstance();
    let wbItemWork;
    switch (action) {
      case ItemLifeCycleEnum.MODIFY:
        wbItemWork = new WbItemWork(ItemLifeCycleEnum.MODIFY, this.prevItemState[0]);
        break;
      case ItemLifeCycleEnum.DESTROY:
        wbItemWork = new WbItemWork(ItemLifeCycleEnum.DESTROY, this.prevItemState[0]);

        for(let wbItem of this.wbItemGroup){
          if(wbItem instanceof WhiteboardShape){
            let edtLinkList:Array<EditableLink> = wbItem.extractAllLinkAsDto();
            for(let edtLink of edtLinkList){
                this.prevItemState.push(edtLink.exportToDto());
            }
          }
        }

        break;
    }

    wbItemWork.wbItemDtoArray = this.prevItemState;
    workHistoryManager.pushIntoStack(wbItemWork);
    this.saveCurrentItemState();
  }

  refreshGsg(){
    if(this.layerService.globalSelectedGroup.getNumberOfChild() > 0){
      let prevItemList:Array<WhiteboardItem> = new Array<WhiteboardItem>();

      for(let wbItem of this.wbItemGroup) {
        prevItemList.push(wbItem);
      }

      this.layerService.globalSelectedGroup.extractAllFromSelection();

      for(let wbItem of prevItemList) {
        this.layerService.globalSelectedGroup.insertOneIntoSelection(wbItem);
      }
    }
  }

  public static getInstance(id, layerService) {
    if (!GlobalSelectedGroup.globalSelectedGroup) {
      GlobalSelectedGroup.globalSelectedGroup = new GlobalSelectedGroup(
        id, WhiteboardItemType.GLOBAL_SELECTED_GROUP, null, layerService);
    }
    return GlobalSelectedGroup.globalSelectedGroup;
  }

  public copySelectedWbItems(){
    let linkMap = new Map<number, EditableLink>();
    this.extractCopiedItems();

    for (let i = 0; i < this.wbItemGroup.length; i++) {
      let currItem = this.wbItemGroup[i];
      this.copiedDtoArray.push(currItem.exportToDto());

      // 도형의 링크를 복사하는 과정
      if(currItem instanceof WhiteboardShape) {
        currItem.linkPortMap.forEach(linkPort => {
          linkPort.fromLinkList.forEach(link => {
            if(linkMap.has(link.id)) {
              this.copiedDtoArray.push(link.exportToDto());
            } else {
              linkMap.set(link.id, link);
            }
          });
        });
      }
    }
  }

  public extractCopiedItems(){
    this.copiedDtoArray.splice(0, this.copiedDtoArray.length);
  }

  public waitForCloneOperation() :Observable<any>{

    return new Observable<any>((observer)=>{
      WhiteboardItemFactory.cloneWbItems(this.copiedDtoArray).subscribe((copiedItems:Array<WhiteboardItem>)=>{
        this.extractAllFromSelection();
        // this.extractCopiedItems();
        observer.next(copiedItems);
      });
    });
  }

  public doCopy(){
    if(this.wbItemGroup.length > 0){
      this.copySelectedWbItems();
    }
  }

  public doPaste(newPosition){
    if(this.copiedDtoArray.length > 0){
      this.waitForCloneOperation().subscribe((data:Array<WhiteboardItem>)=>{
        this.layerService.uiService.spin$.next(true);

        // for (let i = 0; i < data.length; i++) {
        //   this.insertOneIntoSelection(data[i]);
        // }

        let wsWbController = WsWhiteboardController.getInstance();
        let wbItemDtoArray:Array<WhiteboardItemDto> = new Array<WhiteboardItemDto>();

        for (let i = 0; i < data.length; i++) {
          let newWbItem = data[i];
          wbItemDtoArray.push(newWbItem.exportToDto());
        }
        wsWbController.waitRequestCreateMultipleWbItem(wbItemDtoArray)
          .subscribe((wsPacketDto:WebsocketPacketDto)=>{
            let recvWbItemDtoArray:Array<WhiteboardItemDto> = wsPacketDto.dataDto as Array<WhiteboardItemDto>;
            let cloneWbItemList:Array<WhiteboardItem> = new Array<WhiteboardItem>();
            for (let i = 0; i < data.length; i++) {
              let newWbItem = data[i];
              newWbItem.id = recvWbItemDtoArray[i].id;
              newWbItem.zIndex = recvWbItemDtoArray[i].zIndex;
              // newWbItem.group.opacity = 1;
              // newWbItem.coreItem.opacity = 1;
              cloneWbItemList.push(newWbItem);
              // this.insertOneIntoSelection(newWbItem);
            }
            this.insertMultipleIntoSelection(cloneWbItemList).then(()=>{
              this.relocateItemGroup(newPosition);

              let updateDtoList:Array<any> = new Array<any>();
              for (let i = 0; i < data.length; i++) {
                let newWbItem = data[i];
                updateDtoList.push(newWbItem.exportToDto());
              }

              wsWbController.waitRequestUpdateMultipleWbItem(updateDtoList, this.exportToGsgDto()).subscribe(()=>{
                recvWbItemDtoArray.splice(0, recvWbItemDtoArray.length);

                for(let cloneItem of cloneWbItemList){
                  cloneItem.group.opacity = 1;
                  cloneItem.coreItem.opacity = 1;
                  recvWbItemDtoArray.push(cloneItem.exportToDto());
                }
                let workHistoryManager = WorkHistoryManager.getInstance();
                let copyWorkHistory = new WbItemWork(ItemLifeCycleEnum.CREATE, recvWbItemDtoArray[0]);

                copyWorkHistory.wbItemDtoArray = recvWbItemDtoArray;

                workHistoryManager.pushIntoStack(copyWorkHistory);

                this.layerService.uiService.spin$.next(false);
              });
            });
          })
      });
    }
  }

  public lockItems() {
    this.wbItemGroup.forEach(value => {
      value.isLocked = true;
      value.localEmitLocked();
      value.globalEmitLocked();
    });
    let dtoList = this.exportSelectionToDto();

    let wsWbController = WsWhiteboardController.getInstance();
    let subscription = wsWbController.waitRequestUpdateMultipleWbItem(dtoList).subscribe(()=>{
      subscription.unsubscribe();
      this.localEmitLocked();
      this.isLocked = true;
    });
  }

  public unlockItems() {
    this.wbItemGroup.forEach(value => {
      value.isLocked = false;
      value.localEmitUnlocked();
      value.globalEmitUnlocked();
    });

    let dtoList = this.exportSelectionToDto();

    let wsWbController = WsWhiteboardController.getInstance();
    let subscription = wsWbController.waitRequestUpdateMultipleWbItem(dtoList).subscribe(()=>{
      subscription.unsubscribe();
      this.localEmitUnlocked();
      this.isLocked = false;
    });
  }

  //####################
  public deleteSelectedLink(){
    this.wbItemGroup.forEach((value, index, array)=>{
      if(value instanceof WhiteboardShape){
        value.linkPortMap.forEach((value, key, map)=>{
          value.fromLinkList.forEach((value, index, array)=>{
            if(value.isSelected){
              value.destroyItem();
            }
          })
        })
      }
    });
    this.isLinkSelected = false;
    this.extractAllFromSelection();
  }

  public insertOneIntoSelection(wbItem: WhiteboardItem) {
    // 아이템 그룹일 경우 그룹 안에 있는 모든 아이템을 GSG 에 추가

    if(this.checkLocking(wbItem)) {
      return;
    }
    if(wbItem.groupedIdList.length > 0){
      for(let currId of wbItem.groupedIdList){
        let foundItem = this.layerService.findItemById(currId);
        if(foundItem){
          this.insertOneIntoGroup(foundItem);
        }
      }
    }
    this.insertOneIntoGroup(wbItem);
    this.resetMyItemAdjustor();
    this.layerService.horizonContextMenuService.open();
    //this.emitSelected();
    this.saveCurrentItemState();
    this.gsgSelectorEventEmitter.emit(new GsgSelectEvent(GsgSelectEventEnum.SELECTED, wbItem));
  }
  public insertMultipleIntoSelection(wbItemList: Array<WhiteboardItem>) :Promise<any>{
    return new Promise<any>((resolve, reject)=>{
      console.log("GlobalSelectedGroup >> insertMultipleIntoSelection >> 진입함");
      for(let wbItem of wbItemList){
        if(this.checkLocking(wbItem)) {
          return;
        }
        if(wbItem.groupedIdList.length > 0){
          for(let currId of wbItem.groupedIdList){
            let foundItem = this.layerService.findItemById(currId);
            if(foundItem){
              this.insertOneIntoGroup(foundItem);
            }
          }
        }
        this.insertOneIntoGroup(wbItem);
      }
      this.resetMyItemAdjustor();
      this.layerService.horizonContextMenuService.open();

      this.saveCurrentItemState();
      let wsWbController = WsWhiteboardController.getInstance();

      let gsgDto = this.exportToGsgDto();

      wsWbController.waitRequestOccupyWbItem(gsgDto)
        .subscribe(()=>{
          resolve();
        },(errorParam:WebsocketPacketDto)=>{
          this.extractAllFromSelection();
        });
    });
  }

  private setLifeCycleEvent() {
    this.localLifeCycleEmitter.subscribe((event: ItemLifeCycleEvent) => {
      switch (event.action) {
        case ItemLifeCycleEnum.SELECT_CHANGED:
          let gsg = event.item as GlobalSelectedGroup;
          if(gsg.getNumberOfChild() === 1) {
            let item = gsg.wbItemGroup[0];
            if(item instanceof WhiteboardShape) {
              item.enableLinkPort();
            } else if (item instanceof EditableLink) {
              item.enableHandlers();
            }
          } else if (gsg.getNumberOfChild() > 1) {
            let item = gsg.wbItemGroup[0];
            if(item instanceof WhiteboardShape) {
              item.disableLinkPort();
            } else if (item instanceof EditableLink) {
              item.disableHandlers();
            }
          }
          break;
      }
    })
  }

  private checkLocking(wbItem: WhiteboardItem) {
    // GSG 에 하나 이상의 아이템이 있음 --> 선택된 개체가 있음
    if(this.getNumberOfChild() > 0) {
      // 첫번째 아이템이 잠겨 있는지 확인 --> 잠긴 아이템을 GSG 가 갖고 있다는 의미
      if (this.wbItemGroup[0].isLocked) {
        return true;
      // 추가될 아이템이 잠겨 있는지 확인
      } else if (wbItem.isLocked) {
        return true;
      }
      // 결과적으로 잠겨있는 아이템과 함께 다른 아이템들을 잡을 수 없음
    }
    if(wbItem.isLocked) {
      this.isLocked = true;
    }

    return false;
  }

  public extractAllFromSelection() {
    let prevWbItemGroup:Array<WhiteboardItem> = new Array<WhiteboardItem>();
    for(let prevWbItem of this.wbItemGroup){
      prevWbItemGroup.push(prevWbItem);
    }
    this.layerService.horizonContextMenuService.close();
    /*for(let i = 0 ; i < this.wbItemGroup.length; i++){
      this.gsgSelectorEventEmitter.emit(new GsgSelectEvent(GsgSelectEventEnum.DESELECTED, this.wbItemGroup[i]));
    }*/

    let gsgDto = this.exportToGsgDto();
    let wsWbController = WsWhiteboardController.getInstance();
    wsWbController.waitRequestNotOccupyWbItem(gsgDto).subscribe(()=>{});

    this.isLinkSelected = false;
    this.extractAllFromGroup();
    this.isLocked = false;
    this.saveCurrentItemState();

    this.applyZIndexToSelection();

  }

  public removeOneFromGroup(wbItem) {
    this.extractOneFromGroup(wbItem);
    if(this.wbItemGroup.length > 0) {
      this.layerService.horizonContextMenuService.open();
    } else {
      this.layerService.horizonContextMenuService.close();
    }
    this.saveCurrentItemState();
    this.gsgSelectorEventEmitter.emit(new GsgSelectEvent(GsgSelectEventEnum.DESELECTED, wbItem));
  }

  extractOneFromGroup(wbItem: WhiteboardItem) {
    super.extractOneFromGroup(wbItem);
    this.saveCurrentItemState();
  }

  destroyItem() {
    this.pushGsgWorkIntoWorkHistroy(ItemLifeCycleEnum.DESTROY);
    // this.destroyAllFromGroup();
    let deleteList:Array<WhiteboardItemDto> = this.exportSelectionToDto();
    let wsWbController = WsWhiteboardController.getInstance();
    wsWbController.waitRequestDeleteMultipleWbItem(deleteList).subscribe(()=>{
      for(let wbItem of this.wbItemGroup){
        wbItem.destroyItemAndNoEmit();
      }

      this.wbItemGroup.splice(0, this.wbItemGroup.length);

      this.layerService.horizonContextMenuService.close();
      this.resetMyItemAdjustor();
    });
  }
  destroyItemAndNoEmit() {
    // this.destroyAllFromGroup();
    this.destroyBlind();
  }

  exportSelectionToDto() {
    let dtoList:Array<WhiteboardItemDto> = new Array<WhiteboardItemDto>();
    for(let wbItem of this.wbItemGroup){
      dtoList.push(wbItem.exportToDto());
    }
    return dtoList;
  }
  exportToGsgDto() :GlobalSelectedGroupDto{
    let gsgBoundary = this.group.bounds;
    let wbItemIdGroup:Array<any> = new Array<any>();
    for(let selectedItem of this.wbItemGroup){
      wbItemIdGroup.push(selectedItem.id);
    }
    return new GlobalSelectedGroupDto(
      gsgBoundary.width, gsgBoundary.height,
      new GachiPointDto(gsgBoundary.topLeft.x, gsgBoundary.topLeft.y)
      , wbItemIdGroup
    );
  }

  get isLocked(): boolean {
    return super.isLocked;
  }

  set isLocked(value: boolean) {
    super.isLocked = value;
    this.resetMyItemAdjustor();
  }

  get isLinkSelected(): boolean {
    return this._isLinkSelected;
  }

  set isLinkSelected(value: boolean) {
    this._isLinkSelected = value;
  }

  get bound(): Path.Rectangle {
    if(!!this._myItemAdjustor) {
      return this._myItemAdjustor.bound;
    }
    return undefined;
  }
}
