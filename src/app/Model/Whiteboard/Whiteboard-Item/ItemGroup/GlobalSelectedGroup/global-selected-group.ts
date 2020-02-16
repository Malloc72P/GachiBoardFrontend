import * as paper from 'paper';
// @ts-ignore
import Item = paper.Item;

import {ItemGroup} from '../item-group';
import {WhiteboardItemType} from '../../../../Helper/data-type-enum/data-type.enum';
import {SelectModeEnum} from '../../../InfiniteCanvas/DrawingLayerManager/SelectModeEnum/select-mode-enum.enum';
import {WhiteboardItem} from '../../whiteboard-item';
import {SelectEvent} from '../../../InfiniteCanvas/DrawingLayerManager/SelectEvent/select-event';
import {SelectEventEnum} from '../../../InfiniteCanvas/DrawingLayerManager/SelectEventEnum/select-event.enum';
import {WhiteboardShape} from '../../Whiteboard-Shape/whiteboard-shape';
import {WhiteboardItemDto} from '../../../WhiteboardItemDto/whiteboard-item-dto';
import {WhiteboardItemFactory} from '../../../InfiniteCanvas/WhiteboardItemFactory/whiteboard-item-factory';
import {Observable} from 'rxjs';
import {EditableLink} from "../../Whiteboard-Shape/LinkPort/EditableLink/editable-link";

export class GlobalSelectedGroup extends ItemGroup {
  private static globalSelectedGroup: GlobalSelectedGroup;
  private _currentSelectMode;
  private prevMode;
  private prevNumberOfChild;

  private copiedDtoArray:Array<WhiteboardItemDto>;

  private _isLinkSelected = false;

  private constructor(id, type, item: Item, layerService) {
    super(id, type, item, layerService);
    this.prevMode = SelectModeEnum.SINGLE_SELECT;
    this.prevNumberOfChild = this.getNumberOfChild();
    this.copiedDtoArray = new Array<WhiteboardItemDto>();
    this.notifyItemCreation();
    //this.myItemAdjustor.disable();
    //this.activateSelectedMode();
  }

  public static getInstance(id, layerService) {
    if (!GlobalSelectedGroup.globalSelectedGroup) {
      GlobalSelectedGroup.globalSelectedGroup = new GlobalSelectedGroup(
        id, WhiteboardItemType.GLOBAL_SELECTED_GROUP, null, layerService);
    }
    return GlobalSelectedGroup.globalSelectedGroup;
  }

  public copySelectedWbItems(){
    for (let i = 0; i < this.wbItemGroup.length; i++) {
      let currItem = this.wbItemGroup[i];
      this.copiedDtoArray.push(currItem.exportToDto());
    }
  }
  public extractCopiedItems(){
    this.copiedDtoArray.splice(0, this.copiedDtoArray.length);
  }

  public waitForCloneOperation() :Observable<any>{
    console.log("GlobalSelectedGroup >> pasteSelectedWbItems >> 진입함");
    return new Observable<any>((observer)=>{
      WhiteboardItemFactory.cloneWbItems(this.copiedDtoArray).subscribe((copiedItems:Array<WhiteboardItem>)=>{
        this.extractAllFromSelection();
        this.extractCopiedItems();
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
        console.log("GlobalSelectedGroup >> subscribe finally pasted >> 진입함");
        console.log("GlobalSelectedGroup >>  >> newPosition : ",newPosition);
        for (let i = 0; i < data.length; i++) {
          this.insertOneIntoSelection(data[i]);
        }
        this.relocateItemGroup(newPosition);
        for (let i = 0; i < data.length; i++) {
          data[i].group.opacity = 1;
          data[i].coreItem.opacity = 1;
        }
      });
    }
  }

  public lockItems() {
    this.wbItemGroup.forEach(value => {
      value.isLocked = true;
    });
    this.extractAllFromSelection();
  }

  public unlockItems() {
    this.wbItemGroup.forEach(value => {
      value.isLocked = false;
    });
    this.isLocked = false;
  }

  notifyItemCreation() {
    super.notifyItemCreation();
  }
  public notifyItemSelected(wbItem) {
    this.layerService.selectModeEventEmitter
      .emit(new SelectEvent(SelectEventEnum.ITEM_SELECTED, wbItem));
  }
  public notifyItemDeselected(wbItem) {
    this.layerService.selectModeEventEmitter
      .emit(new SelectEvent(SelectEventEnum.ITEM_DESELECTED, wbItem));
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

  public insertOneIntoSelection(wbItem: WhiteboardItem | EditableLink) {
    // 아이템 그룹일 경우 그룹 안에 있는 모든 아이템을 GSG 에 추가
    if(wbItem instanceof ItemGroup) {
      if(this.checkLocking(wbItem)) {
        return;
      }
      wbItem.wbItemGroup.forEach(value => {
        this.insertOneIntoGroup(value);
      });
    // 링크일 경우 링크의 owner 를 GSG 에 추가
    } else if(wbItem instanceof EditableLink) {
      let owner = wbItem.fromLinkPort.owner;
      if(this.checkLocking(owner)) {
        return;
      }
      this.insertOneIntoGroup(owner);
      wbItem.select();
      this.isLinkSelected = true;
    // 나머지는 그냥 추가
    } else {
      if(this.checkLocking(wbItem)) {
        return;
      }
      this.insertOneIntoGroup(wbItem);
    }

    this.resetMyItemAdjustor();
    this.layerService.horizonContextMenuService.open();
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
    this.layerService.horizonContextMenuService.close();
    this.isLinkSelected = false;
    this.extractAllFromGroup();
    this.isLocked = false;
  }

  public removeOneFromGroup(wbItem) {
    this.extractOneFromGroup(wbItem);
    if(this.wbItemGroup.length > 0) {
      this.layerService.horizonContextMenuService.open();
    } else {
      this.layerService.horizonContextMenuService.close();
    }
    this.notifyItemDeselected(wbItem);
  }

  destroyItem() {
    this.destroyAllFromGroup();
  }

  exportToDto() {
    console.warn("GlobalSelectedGroup >> exportToDto >> GSG는 DTO로 추출할 수 없음!!!");
    return null;
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
}
