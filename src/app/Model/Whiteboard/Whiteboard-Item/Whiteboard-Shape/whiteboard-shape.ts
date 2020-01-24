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
import {LinkPort} from './LinkPort/link-port';
import {LinkPortDirectionEnum} from './LinkPort/LinkPortDirectionEnum/link-port-direction-enum.enum';

export class WhiteboardShape extends WhiteboardItem {
  private _width: number;
  private _height: number;
  private _borderColor;
  private _borderWidth: number;
  private _fillColor: paper.Color;
  private _opacity: number;
  private _linkPortMap:Map<any,LinkPort>;
  protected constructor(type, item:Item,
                        posCalcService:PositionCalcService,
                        eventEmitter:EventEmitter<any>,
                        zoomEventEmitter:EventEmitter<any>) {
    super(type, item, posCalcService, eventEmitter, zoomEventEmitter);
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
    this._linkPortMap = new Map<any, LinkPort>();
    for(let i = 0 ; i < 4; i++){
      this._linkPortMap.set( i, new LinkPort(this,i, this.posCalcService) );
    }
  }


  get linkPortMap(): Map<any, LinkPort> {
    return this._linkPortMap;
  }

  set linkPortMap(value: Map<any, LinkPort>) {
    this._linkPortMap = value;
  }
  public notifyOwnerChangeEventToLinkPort(){
    this.linkPortMap.forEach((value, key, map)=>{
      value.onOwnerChanged();
    })
  }
  public getDirectionPoint(direction){
    switch (direction) {
      case LinkPortDirectionEnum.TOP :
        return this.group.bounds.topCenter;
      case LinkPortDirectionEnum.BOTTOM :
        return this.group.bounds.bottomCenter;
      case LinkPortDirectionEnum.LEFT :
        return this.group.bounds.leftCenter;
      case LinkPortDirectionEnum.RIGHT :
        return this.group.bounds.rightCenter;
    }
  }
  public getClosestLinkPort(point){
    let centerOfToWbShape = point;

    let closestDirection = 0;
    let closestDistance = this.posCalcService
      .calcPointDistanceOn2D(centerOfToWbShape, this.group.bounds.topCenter);
    for(let i = 1 ; i < 4; i++){
      let newDistance = this.posCalcService
        .calcPointDistanceOn2D(centerOfToWbShape, this.getDirectionPoint(i));
      if(newDistance < closestDistance){
        closestDirection = i;
        closestDistance = newDistance;
      }
    }
    return closestDirection;
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
}
