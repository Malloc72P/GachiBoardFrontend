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
// @ts-ignore
import Rectangle = paper.Path.Rectangle;

import {ItemGroup} from '../item-group';
import {Editable} from '../../InterfaceEditable/editable';
import {WhiteboardItemType} from '../../../../Helper/data-type-enum/data-type.enum';
import {WhiteboardItem} from '../../whiteboard-item';
import {ItemLifeCycleEnum, ItemLifeCycleEvent} from '../../WhiteboardItemLifeCycle/WhiteboardItemLifeCycle';
import {EditableItemGroupDto} from '../../../../../DTO/WhiteboardItemDto/ItemGroupDto/EditableItemGroupDto/editable-item-group-dto';

export class EditableItemGroup extends ItemGroup implements Editable{
  constructor(id, layerService) {
    super(id, WhiteboardItemType.EDITABLE_GROUP, null, layerService);

    this.group = new Group();

    this.localEmitCreate();
    this.globalEmitCreate();
  }

  public addItem(wbItem:WhiteboardItem){
    if(wbItem.isGrouped){
      wbItem.parentEdtGroup.destroyItem();
    }
    wbItem.isGrouped = true;
    wbItem.parentEdtGroup = this;
    this.wbItemGroup.splice(this.wbItemGroup.length, 0, wbItem);
  }
  public destroyItem() {
    this.coreItem.remove();

    this.wbItemGroup.forEach((value, index, array)=>{
      value.isGrouped = false;
      value.parentEdtGroup = null;
    });

    this.localEmitDestroy();
    this.globalEmitDestroy();
  }
  public destroyItemAndNoEmit() {
    this.coreItem.remove();

    this.wbItemGroup.forEach((value, index, array)=>{
      value.isGrouped = false;
      value.parentEdtGroup = null;
    });
    this.destroyBlind();
  }

  public pushAllChildIntoGSG(){
    this.wbItemGroup.forEach((value, index, array)=>{
      this.layerService.globalSelectedGroup.insertOneIntoSelection(value);
    })
  }

  exportToDto(): EditableItemGroupDto {
    return super.exportToDto() as EditableItemGroupDto;
  }

  public update(dto: EditableItemGroupDto) {
    super.update(dto);
  }

  onOccupied(occupierName) {
    console.log("WhiteboardItem >> onOccupied >> 진입함");
    // let blindRect:Rectangle = new Rectangle(this.group.bounds);
    if(!this.isOccupied){
      this.isOccupied = true;

      for(let groupItem of this.wbItemGroup){
        this.group.addChild(groupItem.group);
      }

      this.blindGroup = new Group();

      let blindRect = new Rectangle({
        from: this.group.bounds.topLeft,
        to: this.group.bounds.bottomRight,
      });
      blindRect.name = "blind-main";
      // @ts-ignore
      blindRect.fillColor = "black";
      // @ts-ignore
      blindRect.opacity = 0.3;

      let blindText = new PointText(this.group.bounds.bottomRight);
      // @ts-ignore
      blindText.fillColor = "white";
      blindText.fontWeight = "bold";
      blindText.content = occupierName + " 님이 수정중";
      blindText.bounds.topRight = this.group.bounds.bottomRight;
      blindText.name = "blind-text";

      let blindTextBg = new Rectangle({
        from: blindText.bounds.topLeft,
        to: blindText.bounds.bottomRight,
      });
      // @ts-ignore
      blindTextBg.fillColor = "black";
      blindTextBg.name = "blind-text-bg";
      // @ts-ignore
      blindTextBg.opacity = 0.5;
      // @ts-ignore
      blindTextBg.bounds.topLeft = blindText.bounds.topLeft;

      blindText.bringToFront();

      this.blindGroup.addChild(blindRect);
      this.blindGroup.addChild(blindTextBg);
      this.blindGroup.addChild(blindText);

      this.layerService.globalSelectedGroup.extractOneFromGroup(this);
      this.blindGroup.bringToFront();
    }

  }
  onNotOccupied() {
    console.log("EditableItemGroup >> onNotOccupied >> 진입함");
    if(this.isOccupied){
      this.isOccupied = false;
      if(this.blindGroup){
        this.blindGroup.removeChildren();
        this.blindGroup.remove();
      }
      for(let groupItem of this.wbItemGroup){
        this.layerService.drawingLayer.addChild(groupItem.group);
      }
    }

  }
}
