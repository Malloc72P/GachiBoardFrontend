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

export class GlobalSelectedGroup extends ItemGroup {
  private static globalSelectedGroup: GlobalSelectedGroup;

  private constructor(type, item: Item,
                      posCalcService: PositionCalcService,
                      eventEmitter: EventEmitter<any>,
                      zoomEventEmitter: EventEmitter<any>) {
    super(type, item, posCalcService, eventEmitter, zoomEventEmitter);
  }

  public static getInstance(posCalcService: PositionCalcService,
                            eventEmitter: EventEmitter<any>,
                            zoomEventEmitter: EventEmitter<any>) {
    if (!GlobalSelectedGroup.globalSelectedGroup) {


      GlobalSelectedGroup.globalSelectedGroup = new GlobalSelectedGroup(
        WhiteboardItemType.GLOBAL_SELECTED_GROUP,
        null,
        posCalcService,
        eventEmitter,
        zoomEventEmitter);
    }
    return GlobalSelectedGroup.globalSelectedGroup;
  }

  notifyItemCreation() {
    super.notifyItemCreation();
  }
}
