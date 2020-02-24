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
import {GachiPointDto} from "../../../../DTO/WhiteboardItemDto/PointDto/gachi-point-dto";

export abstract class EditableStroke extends WhiteboardItem implements Editable{
  protected constructor(id, type, path: Path, layerService) {
    super(id, type, path, layerService);

    this.disableLinkHandler = true;

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
    editableStrokeDto.strokeColor = GachiColorDto.createColor(this.strokeColor);

    //strokeSegments 추출
    editableStrokeDto.segments = new Array<GachiSegmentDto>();
    for(let i = this.segments.length - 1 ; i >= 0; i--){
      editableStrokeDto.segments
        .push(new GachiSegmentDto(this.segments[i]));
    }

    //strokeWidth 추출
    editableStrokeDto.strokeWidth = this.strokeWidth;

    return editableStrokeDto;
  }

  public update(dto: EditableStrokeDto) {
    super.update(dto);

    this.segments.splice(0, this.segments.length);
    dto.segments.forEach(value => {
      this.segments.push(new Segment(
        GachiPointDto.getPaperPoint(value.point),
        GachiPointDto.getPaperPoint(value.handleIn),
        GachiPointDto.getPaperPoint(value.handleOut)
      ))
    });

    this.strokeWidth = dto.strokeWidth;
    this.strokeColor = GachiColorDto.getPaperColor(dto.strokeColor);
  }

  get segments(): Array<Segment> {
    let path = this.coreItem as Path;
    return path.segments;
  }

  get strokeWidth(): number {
    return this.coreItem.strokeWidth;
  }

  set strokeWidth(value: number) {
    this.coreItem.strokeWidth = value;
  }

  get strokeColor(): Color {
    return this.coreItem.strokeColor;
  }

  set strokeColor(value: Color) {
    this.coreItem.strokeColor = value;
  }
}
