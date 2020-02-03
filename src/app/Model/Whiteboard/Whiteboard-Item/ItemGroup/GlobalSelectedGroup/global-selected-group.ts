import {ItemGroup} from '../item-group';

import * as paper from 'paper';
import {WhiteboardItemType} from '../../../../Helper/data-type-enum/data-type.enum';
import {SelectModeEnum} from '../../../InfiniteCanvas/DrawingLayerManager/SelectModeEnum/select-mode-enum.enum';
import {WhiteboardItem} from '../../whiteboard-item';
import {SelectEvent} from '../../../InfiniteCanvas/DrawingLayerManager/SelectEvent/select-event';
import {SelectEventEnum} from '../../../InfiniteCanvas/DrawingLayerManager/SelectEventEnum/select-event.enum';
import {WhiteboardShape} from '../../Whiteboard-Shape/whiteboard-shape';
import {WhiteboardItemDto} from '../../../WhiteboardItemDto/whiteboard-item-dto';
import {WhiteboardItemFactory} from '../../../InfiniteCanvas/WhiteboardItemFactory/whiteboard-item-factory';
// @ts-ignore
import Item = paper.Item;
import {merge, Observable} from 'rxjs';
import {EditableRaster} from '../../Whiteboard-Shape/editable-raster/editable-raster';

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

  public pasteSelectedWbItems(){
    console.log("GlobalSelectedGroup >> pasteSelectedWbItems >> 진입함");
    this.extractAllFromSelection();

    return new Observable((observer)=>{
      let observerCounter = this.copiedDtoArray.length;
      let tempGsgArray = new Array<WhiteboardItem>();

      for (let i = 0; i < this.copiedDtoArray.length; i++) {
        let currDto = this.copiedDtoArray[i];
        WhiteboardItemFactory.cloneWbItem(currDto).subscribe((data)=>{
          console.log("GlobalSelectedGroup >>  >> data : ",data);
          //this.insertOneIntoSelection(data);
          tempGsgArray.push(data);
          observerCounter--;
          console.log("GlobalSelectedGroup >>  >> observerCounter : ",observerCounter);

          if(observerCounter <= 0){
            // #### 복제가 완전히 완료된 경우, 해당 조건문에 진입함 ####

            

            //copiedDtoArray 리셋
            this.extractCopiedItems();



            observer.next(tempGsgArray);
          }
        });

      }
    });
  }

  public doCopy(){
    if(this.wbItemGroup.length > 0){
      this.copySelectedWbItems();
    }
  }
  public doPaste(newPosition){
    if(this.copiedDtoArray.length > 0){
      this.pasteSelectedWbItems().subscribe((data:Array<WhiteboardItem>)=>{
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

  public insertOneIntoSelection(wbItem: WhiteboardItem) {
    this.insertOneIntoGroup(wbItem);
  }

  public extractAllFromSelection() {
    this.extractAllFromGroup();
  }

  public removeOneFromGroup(wbItem) {
    this.extractOneFromGroup(wbItem);
  }

  destroyItem() {
    this.destroyAllFromGroup();
  }

  exportToDto() {
    console.warn("GlobalSelectedGroup >> exportToDto >> GSG는 DTO로 추출할 수 없음!!!");
    return null;
  }

  get isLinkSelected(): boolean {
    return this._isLinkSelected;
  }

  set isLinkSelected(value: boolean) {
    this._isLinkSelected = value;
  }
}
