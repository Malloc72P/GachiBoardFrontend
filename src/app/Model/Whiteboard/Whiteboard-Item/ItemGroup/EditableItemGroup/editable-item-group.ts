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
import Rectangle = paper.Rectangle;

import {ItemGroup} from '../item-group';
import {Editable} from '../../InterfaceEditable/editable';
import {WhiteboardItemType} from '../../../../Helper/data-type-enum/data-type.enum';
import {WhiteboardItem} from '../../whiteboard-item';
import {ItemLifeCycleEnum, ItemLifeCycleEvent} from '../../WhiteboardItemLifeCycle/WhiteboardItemLifeCycle';
import {EditableItemGroupDto} from '../../../../../DTO/WhiteboardItemDto/ItemGroupDto/EditableItemGroupDto/editable-item-group-dto';

export class EditableItemGroup extends ItemGroup implements Editable{
  constructor(id, layerService) {
    super(id, WhiteboardItemType.EDITABLE_GROUP, null, layerService);

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

    this.globalLifeCycleEmitter.emit(new ItemLifeCycleEvent(this.id, this, ItemLifeCycleEnum.DESTROY));
  }

  public pushAllChildIntoGSG(){
    this.wbItemGroup.forEach((value, index, array)=>{
      this.layerService.globalSelectedGroup.insertOneIntoSelection(value);
    })
  }

  exportToDto(): EditableItemGroupDto {
    return super.exportToDto() as EditableItemGroupDto;
  }

}
