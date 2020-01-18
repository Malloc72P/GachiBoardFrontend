import * as paper from 'paper';
// @ts-ignore
import Item = paper.Item;
// @ts-ignore
import Group = paper.Group;
// @ts-ignore
import Point = paper.Point;

export abstract class WhiteboardItem {
  private _id;
  private _groupId;
  private _type;
  private _group;
  private _topLeft: Point;
  private _coreItem:Item;

  private static idGenerator:number = 0;

  protected constructor(group, type, item){
    this.id = WhiteboardItem.idGenerator++;
    this.groupId = group.id;
    this.group = group;
    this.type = type;
    this.coreItem = item;
    this.topLeft = item.bounds.topLeft;
  }

  public abstract refreshItem();

  get coreItem(): paper.Item {
    return this._coreItem;
  }

  set coreItem(value: paper.Item) {
    this._coreItem = value;
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

  get groupId() {
    return this._groupId;
  }

  set groupId(value) {
    this._groupId = value;
  }

  get type() {
    return this._type;
  }

  set type(value) {
    this._type = value;
  }
}
