import * as paper from 'paper';

import {Injectable} from '@angular/core';
import {DrawingLayerManagerService} from "../InfiniteCanvas/DrawingLayerManager/drawing-layer-manager.service";
import {WhiteboardItem} from "../Whiteboard-Item/whiteboard-item";
import {WhiteboardItemDto} from "../../../DTO/WhiteboardItemDto/whiteboard-item-dto";
import {WhiteboardShape} from "../Whiteboard-Item/Whiteboard-Shape/whiteboard-shape";
import {EditableLink} from "../Whiteboard-Item/Whiteboard-Shape/LinkPort/EditableLink/editable-link";

@Injectable({
  providedIn: 'root'
})
export class ExportFileService {
  private _isTransparency = false;
  private _isSelectOnly = false;
  private _isInsertPadding = false;
  private _isRename = false;

  private _padding: string;
  private _filename: string;

  constructor(
    private drawingLayer: DrawingLayerManagerService,
  ) {
  }

  public exportToBackupFile() {
    let dtoArray: Array<WhiteboardItemDto>;

    if (this.isSelectOnly) {
      dtoArray = this.exportSelectDTO;
    } else {
      dtoArray = this.exportAllDTO;
    }

    this.downloadObjectToJson(dtoArray);
  }


  public exportToImage(fileType: 'jpg' | 'png', transparency: boolean, selectOnly: boolean, padding?: string, filename?: string) {
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

    if (!!padding) {
      this.drawPadding(tempLayer, padding);
    }

    if (!transparency) {
      this.drawBackground(tempLayer);
    }

    this.downloadImage(tempLayer, filename);
  }

  private downloadImage(layer: paper.Layer, filename: string) {
    const dataUrl = layer.rasterize().toDataURL();
    layer.remove();
    const anchor = document.createElement('a');

    anchor.setAttribute('download', (!!filename ? filename : 'no-name') + '.png');
    const url = dataUrl.replace(/^data:image\/png/, 'data:application/octet-stream');
    anchor.setAttribute('href', url);
    anchor.click();
  }

  private downloadObjectToJson(object: Object) {
    const backupJson = "data:text/json;charset=utf-8," + encodeURIComponent(JSON.stringify(object));
    const anchor = document.createElement('a');

    anchor.setAttribute('download', (!!this.filename ? this.filename : 'no-name') + '.json');
    anchor.setAttribute('href', backupJson);
    anchor.click();
  }

  private drawBackground(layer: paper.Layer) {
    const background = new paper.Path.Rectangle(layer.strokeBounds);
    background.fillColor = new paper.Color('white');
    layer.addChild(background);
    background.sendToBack();
  }

  private drawPadding(layer: paper.Layer, padding: string) {
    const convertedPadding = parseInt(padding);
    if (!!convertedPadding) {
      const bound = layer.strokeBounds;
      const center = bound.center;
      bound.width += convertedPadding * 2;
      bound.height += convertedPadding * 2;
      bound.center = center;
      layer.addChild(new paper.Path.Rectangle(bound));
    }
  }

  private get exportAllDTO(): Array<WhiteboardItemDto> {
    const dtoArray = new Array<WhiteboardItemDto>();
    this.targetLayer.forEach(value => {
      dtoArray.push(value.exportToDto());
    });

    return dtoArray;
  }

  private get exportSelectDTO(): Array<WhiteboardItemDto> {
    const dtoMap = new Map<number, WhiteboardItemDto>();
    const linkMap = new Map<number, EditableLink>();
    this.targetLayer.forEach(value => {
      dtoMap.set(value.id, value.exportToDto());

      if (value instanceof WhiteboardShape) {
        value.linkPortMap.forEach(linkPort => {
          linkPort.fromLinkList.forEach(link => {
            if (linkMap.has(link.id)) {
              dtoMap.set(link.id, link.exportToDto());
            } else {
              linkMap.set(link.id, link);
            }
          });
        });
      }
    });

    return Array.from(dtoMap.values());
  }

  private get targetLayer(): Array<WhiteboardItem> {
    if (this.isSelectOnly) {
      return this.drawingLayer.globalSelectedGroup.wbItemGroup;
    } else {
      return this.drawingLayer.whiteboardItemArray;
    }
  }

  get isSelected(): boolean {
    return this.drawingLayer.globalSelectedGroup.isSelected;
  }

  get isTransparency(): boolean {
    return this._isTransparency;
  }

  set isTransparency(value: boolean) {
    this._isTransparency = value;
  }

  get isSelectOnly(): boolean {
    return this._isSelectOnly;
  }

  set isSelectOnly(value: boolean) {
    this._isSelectOnly = value;
  }

  get isInsertPadding(): boolean {
    return this._isInsertPadding;
  }

  set isInsertPadding(value: boolean) {
    this._isInsertPadding = value;
  }

  get isRename(): boolean {
    return this._isRename;
  }

  set isRename(value: boolean) {
    this._isRename = value;
  }

  get padding(): string {
    return this._padding;
  }

  set padding(value: string) {
    this._padding = value;
  }

  get filename(): string {
    return this._filename;
  }

  set filename(value: string) {
    this._filename = value;
  }
}
