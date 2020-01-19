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
import Raster = paper.Raster;

import {EventEmitter} from '@angular/core';
import {WhiteboardShape} from '../whiteboard-shape';
import {ItemLifeCycleEnum, ItemLifeCycleEvent} from '../../WhiteboardItemLifeCycle/WhiteboardItemLifeCycle';

export abstract class EditableRaster extends WhiteboardShape {
  private _imageBlob: string;
  protected constructor(group, type, item:Raster,
                        posCalcService,
                        eventEmitter:EventEmitter<any>) {
    super(group, type, item, posCalcService, eventEmitter);
    // @ts-ignore
    this.imageBlob = item.image.src;

  }

  notifyItemCreation() {
    console.log("EditableRaster >> notifyItemCreation >> 진입함");
    this.lifeCycleEventEmitter.emit(new ItemLifeCycleEvent(this.id, this, ItemLifeCycleEnum.CREATE));
  }

  notifyItemModified() {
    console.log("EditableRaster >> notifyItemModified >> 진입함");
    this.lifeCycleEventEmitter.emit(new ItemLifeCycleEvent(this.id, this, ItemLifeCycleEnum.MODIFY));
  }

  refreshItem() {
    console.log("EditableRaster >> refreshItem >> 진입함");
    this.lifeCycleEventEmitter.emit(new ItemLifeCycleEvent(this.id, this, ItemLifeCycleEnum.MODIFY));
  }

  destroyItem() {
    console.log("EditableRaster >> destroyItem >> 진입함");
    this.coreItem.remove();
    this.group.remove();
    this.lifeCycleEventEmitter.emit(new ItemLifeCycleEvent(this.id, this, ItemLifeCycleEnum.DESTROY));
  }


  get imageBlob(): string {
    return this._imageBlob;
  }

  set imageBlob(value: string) {
    this._imageBlob = value;
  }
}
