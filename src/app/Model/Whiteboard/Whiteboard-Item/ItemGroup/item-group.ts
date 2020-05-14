import * as paper from 'paper';
// @ts-ignore
import Path = paper.Path;
// @ts-ignore
import Point = paper.Point;
// @ts-ignore
import Item = paper.Item;
// @ts-ignore
import Segment = paper.Segment;
// @ts-ignore
import Color = paper.Color;
// @ts-ignore
import PointText = paper.PointText;
// @ts-ignore
import Group = paper.Group;

import {WhiteboardItem} from '../whiteboard-item';
import {ItemLifeCycleEnum, ItemLifeCycleEvent} from '../WhiteboardItemLifeCycle/WhiteboardItemLifeCycle';
import {WhiteboardShape} from '../Whiteboard-Shape/whiteboard-shape';
import {ItemGroupDto} from '../../../../DTO/WhiteboardItemDto/ItemGroupDto/item-group-dto';
import {EditableLink} from "../Whiteboard-Shape/LinkPort/EditableLink/editable-link";
import {WsWhiteboardController} from '../../../../Controller/Controller-WebSocket/websocket-manager/WhiteboardWsController/ws-whiteboard.controller';

export class ItemGroup extends WhiteboardItem {
  private _wbItemGroup: Array<WhiteboardItem>;

  // 움직였는지 체크하기 위한 변수
  private isMoved: boolean = false;
  private isResized: boolean = false;

  constructor(id, type, item: Item, layerService) {
    super(id, type, item, layerService);
    this.coreItem = this.group;
    this.wbItemGroup = new Array<WhiteboardItem>();
    //console.log('ItemGroup >> constructor >> 진입함');

  }

  public amIAlreadyHaveThis(wbItem:WhiteboardItem){
    for(let i = 0 ; i < this.wbItemGroup.length; i++){
      let currentItem = this.wbItemGroup[i];
      if(currentItem.id === wbItem.id){
        return true;
      }
    }
    return false;
  }

  //### Mouse Event 콜백
  protected setCallback() {}
  public onMouseDown(event){
    //console.log("ItemGroup >> onMouseDown >> 진입함");
    if(!this.isMovable){
      return;
    }
    this.prevPoint = event.point;
    if(event.modifiers.control === true){
      this.setMultipleSelectMode();
    }
    if(event.modifiers.shift === true){
      this.setMultipleSelectMode();
    }
    if(event.modifiers.alt === true){

    }
    if( this.checkEditable() ){
      if (this.isSingleSelectMode()) {
      }
      else{
        let hitItem = this.layerService.getHittedItem(event.point);

        if(hitItem instanceof WhiteboardItem) {
          if(this.amIAlreadyHaveThis(hitItem)){
            this.layerService.globalSelectedGroup.extractOneFromGroup(hitItem);
          }
        }
      }
    }

  }

  public moveByDelta(event) {
    if(!this.isMovable) {
      return;
    }
    this.calcCurrentDistance(event);
    if(this.checkEditable()) {
      this.group.position.x += event.delta.x;
      this.group.position.y += event.delta.y;

      this.isMoved = true;
      this.localEmitMoved();
      this.wbItemGroup.forEach(value => {
        value.localEmitMoved();
      });
    }
  }

  private moveTo(position: Point) {
    if(this.isMovable) {
      this.isMoved = true;
      this.group.position = position;
      this.localEmitMoved();
      this.wbItemGroup.forEach(value => {
        value.localEmitMoved();
        value.globalEmitMoved();
      });
    }
  }

  public resizeTo(bound: paper.Rectangle) {
    this.group.bounds = bound;
    this.isResized = true;
    this.localEmitResized();
    this.wbItemGroup.forEach(value => {
      value.localEmitResized();
      value.globalEmitResized();
    });
  }

  public onMouseDrag(event){
    if(!this.isMovable){
      return;
    }

    this.calcCurrentDistance(event);
    let currentPointerMode = this.layerService.currentPointerMode;
    this.calcCurrentDistance(event);
    if( this.checkEditable()  ) {
      this.group.position.x += event.delta.x;
      this.group.position.y += event.delta.y;
    }
  }

  public moveEnd() {
    if(this.isMoved) {
      this.wbItemGroup.forEach(value => {
        value.localEmitModify();
        value.globalEmitModify();
      });
      this.localEmitModify();
      this.isMoved = false;
      return true;
    }
    return false;
  }

  public resizeEnd() {
    if(this.isResized) {
      this.wbItemGroup.forEach(value => {
        value.localEmitModify();
        value.globalEmitModify();
      });
      this.localEmitModify();
      this.isResized = false;
    }
  }

  public onMouseUp(event){
    //console.log("ItemGroup >> onMouseUp >> 이걸 발견 하신다면 제보해주세요 - 윤상현");
    this.calcCurrentDistance(event);
    if(!this.isMovable){
      return;
    }

    this.resetDistance();
    this.setSingleSelectMode();
    this.globalLifeCycleEmitter.emit(new ItemLifeCycleEvent(this.id,this,ItemLifeCycleEnum.MODIFY));
    // this.wbItemGroup.forEach((value, index, array)=>{
    //   value.refreshItem();
    // })
  }


  public resetMyItemAdjustor(){
    if(this.getNumberOfChild() === 1 && this.wbItemGroup[0] instanceof EditableLink){
      this.deactivateSelectedMode();
    } else if(this.getNumberOfChild() > 0) {
      this.activateSelectedMode();
    } else {
      this.deactivateSelectedMode();
    }
  }

  private retractGroup(){
    this.group.bounds = new paper.Rectangle(new Point(0,0), new Point(0,0));
  }

  public relocateItemGroup(newPosition){
    this.moveTo(newPosition);
    this.layerService.horizonContextMenuService.refreshPosition();
  }

  public insertOneIntoGroup(wbItem: WhiteboardItem) {
    if(this.amIAlreadyHaveThis(wbItem)){
      return false;
    }
    this.wbItemGroup.push(wbItem);
    wbItem.isSelected = true;
    let wbItemPaperIdx = wbItem.group.index;
    // //console.log("ItemGroup >> insertOneIntoGroup >> wbItemPaperIdx : ",wbItemPaperIdx);
    this.coreItem.addChild(wbItem.group);
    this.layerService.drawingLayer.insertChild(wbItemPaperIdx, this.coreItem);
    //this.group.bringToFront();

    wbItem.localEmitSelected();
    wbItem.globalEmitSelected();
    this.localEmitSelectChanged();
  }

  public extractOneFromGroup(wbItem: WhiteboardItem) {
    for (let i = 0; i < this.wbItemGroup.length; i++) {
      if (this.wbItemGroup[i].id === wbItem.id) {
        let drawingLayer = this.coreItem.parent;
        //자식을 drawingLayer 로 옮겨줌.
        let willBeExtract = this.wbItemGroup[i];
        willBeExtract.isSelected = false;

        drawingLayer.addChild(willBeExtract.group);
        this.wbItemGroup.splice(i, 1);
        this.resetMyItemAdjustor();

        willBeExtract.localEmitDeselected();
        willBeExtract.globalEmitDeselected();

        // if(this.getNumberOfChild() === 1) {
        //   this.wbItemGroup[0].localEmitSelected();
        // }

        this.localEmitSelectChanged();
        return;
      }
    }
  }
  public destroyOneFromGroup(wbItem: WhiteboardItem) {

    for (let i = 0; i < this.wbItemGroup.length; i++) {
      if (this.wbItemGroup[i].id === wbItem.id) {
        let willBeDestroyed = this.wbItemGroup[i];

        this.wbItemGroup.splice(i, 1);
        this.resetMyItemAdjustor();
        willBeDestroyed.destroyItem();

        return;
      }
    }
  }

  public extractAllFromGroup() {
    let drawingLayer = this.coreItem.parent;
    for (let i = 0; i < this.wbItemGroup.length; i++) {
      //자식을 drawingLayer로 옮겨줌.
      let willBeExtract = this.wbItemGroup[i];
      willBeExtract.isSelected = false;
      drawingLayer.addChild(willBeExtract.group);
      willBeExtract.localEmitDeselected();
      willBeExtract.globalEmitDeselected();
    }
    this.wbItemGroup.splice(0, this.wbItemGroup.length);
    this.resetMyItemAdjustor();
    this.localEmitSelectChanged();
  }
  public destroyAllFromGroup() {
    for (let i = 0; i < this.wbItemGroup.length; i++) {

      let willBeDestroy = this.wbItemGroup[i];
      willBeDestroy.destroyItem();
    }
    this.wbItemGroup.splice(0, this.wbItemGroup.length);

    this.layerService.horizonContextMenuService.close();
    this.resetMyItemAdjustor();
  }


  destroyItem() {
    super.destroyItem();
    //unGroup하는 작업 실시
    this.coreItem.remove();
    this.globalLifeCycleEmitter.emit(new ItemLifeCycleEvent(this.id, this, ItemLifeCycleEnum.DESTROY));
  }
  destroyItemAndNoEmit() {
    // super.destroyItem();
    //unGroup하는 작업 실시
    this.coreItem.remove();
    this.destroyBlind();
  }

  public getNumberOfChild() {
    return this.wbItemGroup.length;
  }

  exportToDto(): ItemGroupDto {
    let itemGroupDto:ItemGroupDto = super.exportToDto() as ItemGroupDto;
    itemGroupDto.wbItemIdGroup = new Array<number>();

    for (let i = 0; i < this.wbItemGroup.length; i++) {
      itemGroupDto.wbItemIdGroup.push(this.wbItemGroup[i].id);
    }

    return itemGroupDto
  }

  public update(dto: ItemGroupDto) {
    super.update(dto);

    this.extractAllFromGroup();
    dto.wbItemIdGroup.forEach(value => {
      let item = this.layerService.getItemById(value);
      item.isGrouped = true;
      item.parentEdtGroup = this;
      this.wbItemGroup.splice(this.wbItemGroup.length, 0, item);
    });
  }

  public localEmitSelectChanged() {
    this.localLifeCycleEmitter.emit(new ItemLifeCycleEvent(this.id, this, ItemLifeCycleEnum.SELECT_CHANGED));
  }

  get wbItemGroup(): Array<WhiteboardItem> {
    return this._wbItemGroup;
  }

  set wbItemGroup(value: Array<WhiteboardItem>) {
    this._wbItemGroup = value;
  }
}
