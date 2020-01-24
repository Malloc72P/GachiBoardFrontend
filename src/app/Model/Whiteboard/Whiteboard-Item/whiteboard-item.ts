import * as paper from 'paper';
// @ts-ignore
import Item = paper.Item;
// @ts-ignore
import Group = paper.Group;
// @ts-ignore
import Point = paper.Point;
import {EventEmitter} from '@angular/core';
import {ItemAdjustor} from './ItemAdjustor/item-adjustor';
import {PositionCalcService} from '../PositionCalc/position-calc.service';

export abstract class WhiteboardItem {
  protected _id;
  protected _type;
  protected _group;
  protected _topLeft: Point;
  protected _coreItem:Item;
  private _isSelected;
  protected _myItemAdjustor:ItemAdjustor;

  private _disableLinkHandler = false;

  private _posCalcService:PositionCalcService;

  protected _lifeCycleEventEmitter:EventEmitter<any>;
  protected _zoomEventEmitter:EventEmitter<any>;

  private static idGenerator:number = 0;

  protected constructor(type, item, posCalcService, eventEmitter, zoomEventEmitter){
    this.id = WhiteboardItem.idGenerator++;
    this.isSelected = false;
    this.group = new Group();
    //this.group.applyMatrix = false;
    if(item){
      item.data.myGroup = this.group;
      this.group.addChild(item);
      this.coreItem = item;
      this.topLeft = item.bounds.topLeft;
    }
    this.group.data.struct = this;

    this.type = type;

    this.posCalcService = posCalcService;

    this.lifeCycleEventEmitter = eventEmitter;
    this.zoomEventEmitter = zoomEventEmitter;
    this.notifyItemCreation();
  }

  public abstract notifyItemCreation();
  public abstract notifyItemModified();
  public abstract refreshItem();
  public abstract destroyItem();

  public activateSelectedMode(){
    if(!this.isSelected){
      this.isSelected = true;
      this.myItemAdjustor = new ItemAdjustor(this);
    }
  }
  public deactivateSelectedMode(){
    if(this.isSelected){
      this.isSelected = false;
      let purgedAdjustor = this.myItemAdjustor;
      this.myItemAdjustor = null;
      if(purgedAdjustor){
        purgedAdjustor.destroyItemAdjustor();
      }
    }
  }

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

  get myItemAdjustor(): ItemAdjustor {
    return this._myItemAdjustor;
  }

  set myItemAdjustor(value: ItemAdjustor) {
    this._myItemAdjustor = value;
  }

  get posCalcService(): PositionCalcService {
    return this._posCalcService;
  }

  set posCalcService(value: PositionCalcService) {
    this._posCalcService = value;
  }

  get disableLinkHandler(): boolean {
    return this._disableLinkHandler;
  }

  set disableLinkHandler(value: boolean) {
    this._disableLinkHandler = value;
  }

  get zoomEventEmitter(): EventEmitter<any> {
    return this._zoomEventEmitter;
  }

  set zoomEventEmitter(value: EventEmitter<any>) {
    this._zoomEventEmitter = value;
  }

  get isSelected() {
    return this._isSelected;
  }

  set isSelected(value) {
    this._isSelected = value;
  }
}
