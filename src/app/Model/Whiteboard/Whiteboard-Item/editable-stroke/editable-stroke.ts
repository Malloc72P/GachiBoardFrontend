
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
import {WhiteboardItem} from '../whiteboard-item';
import {EventEmitter} from '@angular/core';
import {ItemLifeCycleEnum, ItemLifeCycleEvent} from '../WhiteboardItemLifeCycle/WhiteboardItemLifeCycle';

export abstract class EditableStroke extends WhiteboardItem {
  private _segments: Array<Segment>;
  private _strokeWidth: number;
  private _strokeColor: Color;

  protected constructor(group, type, path:Path, eventEmitter:EventEmitter<any>){
    super(group, type, path, eventEmitter);
    this.segments = path.segments;
    this.strokeWidth = path.strokeWidth;
    this.strokeColor = path.strokeColor;
  }

  public notifyItemModified() {
    console.log("EditableStroke >> notifyItemModified >> 진입함");
    this.lifeCycleEventEmitter.emit(new ItemLifeCycleEvent(this.id, this, ItemLifeCycleEnum.MODIFY));
  }

  public notifyItemCreation() {
    console.log("EditableStroke >> createItem >> 진입함");
    this.lifeCycleEventEmitter.emit(new ItemLifeCycleEvent(this.id, this, ItemLifeCycleEnum.CREATE));
  }

  public refreshItem() {
    console.log("EditableStroke >> refreshItem >> 진입함");
    this.lifeCycleEventEmitter.emit(new ItemLifeCycleEvent(this.id, this, ItemLifeCycleEnum.MODIFY));
  }
  public destroyItem() {
    console.log("EditableStroke >> destroyItem >> 진입함");
    this.coreItem.remove();
    this.group.remove();
    this.lifeCycleEventEmitter.emit(new ItemLifeCycleEvent(this.id, this, ItemLifeCycleEnum.DESTROY));
  }

  get segments(): Array<Segment> {
    return this._segments;
  }

  set segments(value: Array<Segment>) {
    this._segments = value;
  }

  get strokeWidth(): number {
    return this._strokeWidth;
  }

  set strokeWidth(value: number) {
    this._strokeWidth = value;
  }

  get strokeColor(): Color {
    return this._strokeColor;
  }

  set strokeColor(value: Color) {
    this._strokeColor = value;
  }
}