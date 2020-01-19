import {WhiteboardItem} from '../whiteboard-item';
import {PositionCalcService} from '../../PositionCalc/position-calc.service';
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

export class WhiteboardShape extends WhiteboardItem {
  private _width: number;
  private _height: number;
  private _borderColor;
  private _borderWidth: number;
  private _fillColor: paper.Color;
  private _opacity: number;
  private _posCalcService:PositionCalcService;
  protected constructor(group, type, item:Item,
                        posCalcService:PositionCalcService,
                        eventEmitter:EventEmitter<any>) {
    super(group, type, item, eventEmitter);
    this.topLeft  = item.bounds.topLeft;
    this.width    = item.bounds.width;
    this.height    = item.bounds.height;
    this.borderColor = item.style.strokeColor;
    this.borderWidth = item.style.strokeWidth;
    if(item.style.fillColor){
      this.fillColor = item.style.fillColor;
    }else{
      // @ts-ignore
      this.fillColor = "transparent";
    }
    this.opacity = item.opacity;

  }

  notifyItemCreation() {
  }

  notifyItemModified() {
  }

  refreshItem() {
  }

  destroyItem() {
  }

  get width(): number {
    return this._width;
  }

  set width(value: number) {
    this._width = value;
  }

  get height(): number {
    return this._height;
  }

  set height(value: number) {
    this._height = value;
  }

  get borderColor() {
    return this._borderColor;
  }

  set borderColor(value) {
    this._borderColor = value;
  }

  get borderWidth(): number {
    return this._borderWidth;
  }

  set borderWidth(value: number) {
    this._borderWidth = value;
  }

  get fillColor(): paper.Color {
    return this._fillColor;
  }

  set fillColor(value: paper.Color) {
    this._fillColor = value;
  }

  get opacity(): number {
    return this._opacity;
  }

  set opacity(value: number) {
    this._opacity = value;
  }

  get posCalcService(): PositionCalcService {
    return this._posCalcService;
  }

  set posCalcService(value: PositionCalcService) {
    this._posCalcService = value;
  }
}
