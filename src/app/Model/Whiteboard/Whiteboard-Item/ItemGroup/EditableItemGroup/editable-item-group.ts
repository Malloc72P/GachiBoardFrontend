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

export class EditableItemGroup extends ItemGroup{
  constructor(type, item:Item, layerService) {
    super(type, item, layerService);
  }

}
