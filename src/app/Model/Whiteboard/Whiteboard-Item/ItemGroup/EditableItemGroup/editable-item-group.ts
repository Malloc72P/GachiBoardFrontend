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
import {WhiteboardItem} from '../../whiteboard-item';
import {ItemLifeCycleEnum, ItemLifeCycleEvent} from '../../WhiteboardItemLifeCycle/WhiteboardItemLifeCycle';

export class EditableItemGroup extends ItemGroup{
  constructor(type, item:Item,
                        posCalcService:PositionCalcService,
                        eventEmitter:EventEmitter<any>,
                        zoomEventEmitter:EventEmitter<any>) {
    super(type, item, posCalcService, eventEmitter, zoomEventEmitter);
  }

}
