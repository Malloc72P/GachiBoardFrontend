import { Injectable } from '@angular/core';
import * as paper from 'paper';
// @ts-ignore
import Layer = paper.Layer;
// @ts-ignore
import Group = paper.Group;
import {SimpleStroke} from '../../Whiteboard-Item/editable-shape/SimpleStroke/simple-stroke';
import {WhiteboardItemType} from '../../../Helper/data-type-enum/data-type.enum';
import {WhiteboardItem} from '../../Whiteboard-Item/whiteboard-item';

@Injectable({
  providedIn: 'root'
})
export class DrawingLayerManagerService {
  private _drawingLayer:Layer;

  private whiteboardItemArray:Array<WhiteboardItem>;

  constructor() {
    this.whiteboardItemArray = new Array<WhiteboardItem>();
  }

  get drawingLayer(): paper.Layer {
    return this._drawingLayer;
  }

  set drawingLayer(value: paper.Layer) {
    this._drawingLayer = value;
  }

  public addToDrawingLayer(item){
    let newGroup = new Group();
    let newWhiteboardItem = new SimpleStroke(
      newGroup,
      WhiteboardItemType.SIMPLE_STROKE,
      item);

    this.whiteboardItemArray.push(newWhiteboardItem);

    newGroup.data.struct = newWhiteboardItem;
    newGroup.addChild(item);

    this.drawingLayer.addChild(newGroup);
  }
}
