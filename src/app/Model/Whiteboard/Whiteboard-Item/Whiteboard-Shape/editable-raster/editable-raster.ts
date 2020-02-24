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
import {PositionCalcService} from '../../../PositionCalc/position-calc.service';
import {EditableRasterDto} from '../../../../../DTO/WhiteboardItemDto/WhiteboardShapeDto/EditableRasterDto/editable-raster-dto';
import {EditableShapeDto} from '../../../../../DTO/WhiteboardItemDto/WhiteboardShapeDto/EditableShapeDto/editable-shape-dto';
import {WhiteboardItemType} from '../../../../Helper/data-type-enum/data-type.enum';

export abstract class EditableRaster extends WhiteboardShape {
  private _imageBlob: string;
  protected constructor(id, type, item,layerService) {
    super(id, type, item, layerService);
    // @ts-ignore
    if(item instanceof Raster){
      // @ts-ignore
      this.imageBlob = item.image.src;
    }else this.imageBlob = null;
    this.notifyItemCreation();
  }

  public doLazyImageLoad(rasterObject){
    let willBeDeleted = this.coreItem;
    if (willBeDeleted) {
      willBeDeleted.remove();
    }

    this.coreItem = rasterObject;

    this.group.addChild(this.coreItem);
    this.imageBlob = rasterObject.image.src
  }

  notifyItemCreation() {
    console.log("EditableRaster >> notifyItemCreation >> 진입함");
    this.globalLifeCycleEmitter.emit(new ItemLifeCycleEvent(this.id, this, ItemLifeCycleEnum.CREATE));
  }

  notifyItemModified() {
    console.log("EditableRaster >> notifyItemModified >> 진입함");
    this.globalLifeCycleEmitter.emit(new ItemLifeCycleEvent(this.id, this, ItemLifeCycleEnum.MODIFY));
    /*this.notifyOwnerChangeEventToLinkPort();*/
  }

  refreshItem() {
    console.log("EditableRaster >> refreshItem >> 진입함");
    this.globalLifeCycleEmitter.emit(new ItemLifeCycleEvent(this.id, this, ItemLifeCycleEnum.MODIFY));
    /*this.notifyOwnerChangeEventToLinkPort();*/
  }

  destroyItem() {
    super.destroyItem();
    console.log("EditableRaster >> destroyItem >> 진입함");
    this.coreItem.remove();
    this.group.remove();
    this.globalLifeCycleEmitter.emit(new ItemLifeCycleEvent(this.id, this, ItemLifeCycleEnum.DESTROY));
  }
  destroyItemAndNoEmit() {
    super.destroyItem();
    console.log("EditableRaster >> destroyItem >> 진입함");
    this.coreItem.remove();
    this.group.remove();
  }

  exportToDto(): EditableRasterDto {
    let editableRasterDto:EditableRasterDto =  super.exportToDto() as EditableRasterDto;
    editableRasterDto.imageBlob = this.imageBlob;
    return editableRasterDto;

  }


  get imageBlob(): string {
    return this._imageBlob;
  }

  set imageBlob(value: string) {
    this._imageBlob = value;
  }
}
