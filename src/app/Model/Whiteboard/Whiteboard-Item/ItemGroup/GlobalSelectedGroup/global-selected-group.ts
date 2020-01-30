import {ItemGroup} from '../item-group';
import {PositionCalcService} from '../../../PositionCalc/position-calc.service';
import {EventEmitter} from '@angular/core';

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
import {WhiteboardItemType} from '../../../../Helper/data-type-enum/data-type.enum';
import {SelectModeEnum} from '../../../InfiniteCanvas/DrawingLayerManager/SelectModeEnum/select-mode-enum.enum';
import {WhiteboardItem} from '../../whiteboard-item';
import {SelectEvent} from '../../../InfiniteCanvas/DrawingLayerManager/SelectEvent/select-event';
import {SelectEventEnum} from '../../../InfiniteCanvas/DrawingLayerManager/SelectEventEnum/select-event.enum';
import {ItemLifeCycleEnum, ItemLifeCycleEvent} from '../../WhiteboardItemLifeCycle/WhiteboardItemLifeCycle';

export class GlobalSelectedGroup extends ItemGroup {
  private static globalSelectedGroup: GlobalSelectedGroup;
  private _currentSelectMode;
  private prevMode;
  private prevNumberOfChild;

  private constructor(id, type, item: Item, layerService) {
    super(id, type, item, layerService);
    this.prevMode = SelectModeEnum.SINGLE_SELECT;
    this.prevNumberOfChild = this.getNumberOfChild();
    //this.activateSelectedMode();
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
}
