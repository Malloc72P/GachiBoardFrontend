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
import {ItemLifeCycleEnum, ItemLifeCycleEvent} from '../WhiteboardItemLifeCycle/WhiteboardItemLifeCycle';
import {Editable} from '../InterfaceEditable/editable';
import {EditableStrokeDto} from '../../../../DTO/WhiteboardItemDto/EditableStrokeDto/editable-stroke-dto';
import {GachiColorDto} from '../../../../DTO/WhiteboardItemDto/ColorDto/gachi-color-dto';
import {GachiSegmentDto} from "../../../../DTO/WhiteboardItemDto/SegmentDto/gachi-segment-dto";

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

    this.notifyItemCreation();
  }

  public notifyItemModified() {
    console.log("EditableStroke >> notifyItemModified >> 진입함");
    this.globalLifeCycleEmitter.emit(new ItemLifeCycleEvent(this.id, this, ItemLifeCycleEnum.MODIFY));
  }

  public notifyItemCreation() {
    console.log("EditableStroke >> createItem >> 진입함");
    this.globalLifeCycleEmitter.emit(new ItemLifeCycleEvent(this.id, this, ItemLifeCycleEnum.CREATE));
  }

  public refreshItem() {
    console.log("EditableStroke >> refreshItem >> 진입함");
    this.globalLifeCycleEmitter.emit(new ItemLifeCycleEvent(this.id, this, ItemLifeCycleEnum.MODIFY));
  }
  public destroyItem() {
    super.destroyItem();
    console.log("EditableStroke >> destroyItem >> 진입함");
    this.coreItem.remove();
    this.group.remove();
    this.globalLifeCycleEmitter.emit(new ItemLifeCycleEvent(this.id, this, ItemLifeCycleEnum.DESTROY));
  }

  public exportToDto(): EditableStrokeDto {
    let editableStrokeDto:EditableStrokeDto =  super.exportToDto() as EditableStrokeDto;

    //strokeColor 추출
    let strokeObject:Path = this.coreItem as Path;
    editableStrokeDto.strokeColor = GachiColorDto.createColor(strokeObject.strokeColor);

    //strokeSegments 추출
    editableStrokeDto.segments = new Array<GachiSegmentDto>();
    for(let i = strokeObject.segments.length-1 ; i >= 0; i--){
      editableStrokeDto.segments
        .push(new GachiSegmentDto(strokeObject.segments[i]));
    }

    //strokeWidth 추출
    editableStrokeDto.strokeWidth = strokeObject.strokeWidth;

    return editableStrokeDto;
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
