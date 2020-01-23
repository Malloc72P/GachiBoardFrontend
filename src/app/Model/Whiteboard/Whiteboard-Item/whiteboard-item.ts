import * as paper from 'paper';
// @ts-ignore
import Item = paper.Item;
// @ts-ignore
import Group = paper.Group;
// @ts-ignore
import Point = paper.Point;
import {EventEmitter} from '@angular/core';

export abstract class WhiteboardItem {
  private _id;
  private _type;
  private _group;
  private _topLeft: Point;
  private _coreItem:Item;


  private _lifeCycleEventEmitter:EventEmitter<any>;


  private static idGenerator:number = 0;

  protected constructor(group, type, item, eventEmitter){
    this.id = WhiteboardItem.idGenerator++;
    this.group = group;
    this.type = type;
    this.coreItem = item;
    this.topLeft = item.bounds.topLeft;
    this.lifeCycleEventEmitter = eventEmitter;
  }

  public abstract notifyItemCreation();
  public abstract notifyItemModified();
  public abstract refreshItem();
  public abstract destroyItem();

  get coreItem(): paper.Item {
    return this._coreItem;
  }

  set coreItem(value: paper.Item) {
    this._coreItem = value;
  }

  get lifeCycleEventEmitter(): EventEmitter<any> {
    return this._lifeCycleEventEmitter;
  }

  set lifeCycleEventEmitter(value: EventEmitter<any>) {
    this._lifeCycleEventEmitter = value;
  }

  get id() {
    return this._id;
  }

  set id(value) {
    this._id = value;
  }

  get topLeft(): paper.Point {
    return this._topLeft;
  }

  set topLeft(value: paper.Point) {
    this._topLeft = value;
  }

  get group() {
    return this._group;
  }

  set group(value) {
    this._group = value;
  }

  get type() {
    return this._type;
  }

  set type(value) {
    this._type = value;
  }
}
