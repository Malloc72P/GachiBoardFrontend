
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
import {Editable} from '../InterfaceEditable/editable';
import {WhiteboardItemDto} from '../../WhiteboardItemDto/whiteboard-item-dto';
import {EditableStrokeDto} from '../../WhiteboardItemDto/EditableStrokeDto/editable-stroke-dto';
import {GachiPointDto} from '../../WhiteboardItemDto/PointDto/gachi-point-dto';
import {GachiColorDto} from '../../WhiteboardItemDto/ColorDto/gachi-color-dto';

export abstract class EditableStroke extends WhiteboardItem implements Editable{
  private _segments: Array<Segment>;
  private _strokeWidth: number;
  private _strokeColor: Color;

  protected constructor(id, type, path:Path, layerService) {
    super(id, type, path, layerService);

    this.disableLinkHandler = true;

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
    super.destroyItem();
    console.log("EditableStroke >> destroyItem >> 진입함");
    this.coreItem.remove();
    this.group.remove();
    this.lifeCycleEventEmitter.emit(new ItemLifeCycleEvent(this.id, this, ItemLifeCycleEnum.DESTROY));
  }

  public exportToDto(): EditableStrokeDto {
    let wbItemDto =  super.exportToDto();
    let edtStrokeDto: EditableStrokeDto;
    let strokeObject:Path = this.coreItem as Path;
    let strokeColor:GachiColorDto = new GachiColorDto(
      strokeObject.strokeColor.red, strokeObject.strokeColor.green, strokeObject.strokeColor.blue, strokeObject.strokeColor.alpha
    );

    let segments = new Array<GachiPointDto>();
    for(let i = segments.length-1 ; i >= 0; i--){
      segments.push(new GachiPointDto(strokeObject.segments[i].point.x, strokeObject.segments[i].point.y))
    }

    edtStrokeDto = new EditableStrokeDto(
      wbItemDto.id,wbItemDto.type,wbItemDto.center,
      segments,strokeObject.strokeWidth,strokeColor,
    );
    return edtStrokeDto;
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
