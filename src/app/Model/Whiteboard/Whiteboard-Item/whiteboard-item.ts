import * as paper from 'paper';
// @ts-ignore
import Item = paper.Item;
// @ts-ignore
import Group = paper.Group;

export abstract class WhiteboardItem {
  private _id;
  private _groupId;
  private _type;

  private static idGenerator:number = 0;

  protected constructor(group, type){
    this.id = WhiteboardItem.idGenerator++;
    this.groupId = group.id;
    this.type = type;
  }

  get id() {
    return this._id;
  }

  set id(value) {
    this._id = value;
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
