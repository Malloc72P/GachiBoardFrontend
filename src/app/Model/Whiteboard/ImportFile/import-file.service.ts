import { Injectable } from '@angular/core';

import * as paper from 'paper';
// @ts-ignore
import Raster = paper.Raster;
// @ts-ignore
import Project = paper.Project;
// @ts-ignore
import Point = paper.Point;
import {PositionCalcService} from "../PositionCalc/position-calc.service";
import {DrawingLayerManagerService} from '../InfiniteCanvas/DrawingLayerManager/drawing-layer-manager.service';
import {WhiteboardItemType} from '../../Helper/data-type-enum/data-type.enum';

@Injectable({
  providedIn: 'root'
})
export class ImportFileService {

  constructor(
    private positionCalcService: PositionCalcService,
    private layerService: DrawingLayerManagerService,
  ) { }

  importFile(object: File) {
    switch (object.type) {
      case "image/jpeg":
      case "image/gif":
      case "image/png":
        console.log("ImportFileService >> importFile >> object.type : ", object.type);
        this.drawImage(object);
        break;
      case "application/pdf":
        console.log("ImportFileService >> importFile >> object : ", object);
        console.log("ImportFileService >> importFile >> object.type : ", object.type);
        break;
      default:
        break;
    }
  }

  drawImage(imageObject: File) {
    let reader = new FileReader();
    let base64Image: string;

    reader.readAsDataURL(imageObject);

    reader.onload = () => {
      // @ts-ignore
      base64Image = reader.result;
      let raster = new Raster(base64Image);
      this.layerService.addToDrawingLayer(raster,WhiteboardItemType.SIMPLE_RASTER);

      raster.position = this.positionCalcService.getCenterOfPaperView();
    };
  }
}
