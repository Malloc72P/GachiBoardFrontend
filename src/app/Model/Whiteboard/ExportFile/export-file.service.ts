import * as paper from 'paper';

import { Injectable } from '@angular/core';
import {DrawingLayerManagerService} from "../InfiniteCanvas/DrawingLayerManager/drawing-layer-manager.service";
import {WhiteboardItem} from "../Whiteboard-Item/whiteboard-item";

@Injectable({
  providedIn: 'root'
})
export class ExportFileService {

  constructor(
    private drawingLayer: DrawingLayerManagerService,
  ) { }

  public exportToImage(fileType: 'jpg' | 'png', transparency: boolean, selectOnly: boolean, padding?: string) {
    const tempLayer = new paper.Layer();
    let targetLayer: Array<WhiteboardItem>;

    if (selectOnly) {
      targetLayer = this.drawingLayer.globalSelectedGroup.wbItemGroup;
    } else {
      targetLayer = this.drawingLayer.whiteboardItemArray;
    }

    targetLayer.forEach(value => {
      tempLayer.addChild(value.group.clone());
    });

    if(!transparency) {
      this.drawBackground(tempLayer);
    }

    // TODO: padding 적용

    const dataUrl = tempLayer.rasterize().toDataURL();
    tempLayer.remove();
    const downloadLink = document.createElement('a');
    downloadLink.setAttribute('download', 'Test.png');
    const url = dataUrl.replace(/^data:image\/png/, 'data:application/octet-stream');
    downloadLink.setAttribute('href', url);
    downloadLink.click();
  }

  private drawBackground(layer: paper.Layer) {
    const background = new paper.Path.Rectangle(layer.strokeBounds);
    background.fillColor = new paper.Color('white');
    layer.addChild(background);
    background.sendToBack();
  }
}
