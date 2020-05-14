import { Injectable } from '@angular/core';
import {PositionCalcService} from "../PositionCalc/position-calc.service";
import {DrawingLayerManagerService} from '../InfiniteCanvas/DrawingLayerManager/drawing-layer-manager.service';
import {WhiteboardItemType} from '../../Helper/data-type-enum/data-type.enum';

import * as paper from 'paper';
// @ts-ignore
import Raster = paper.Raster;
// @ts-ignore
import Project = paper.Project;
// @ts-ignore
import Point = paper.Point;

@Injectable({
  providedIn: 'root'
})
export class ImportFileService {

  constructor(
    private positionCalcService: PositionCalcService,
    private layerService: DrawingLayerManagerService,
  ) { }

  importFile(object: FileList, position?: Point) {
    let sumWidth = { value: 0 };
    let startPoint;

    // view leftTop + (( rightTop - leftTop ) * 0.15 ) 지점부터 이미지 추가 두번째 이미지부터는 width 총합 좌표를 x 값으로 가짐
    if(!position) {
      let paperLeftTop = this.positionCalcService.getTopLeftOfPaperView();
      let startPointX = paperLeftTop.x + (this.positionCalcService.getWidthOfPaperView() * 0.15);
      let startPointY = paperLeftTop.y + (this.positionCalcService.getHeightOfPaperView() * 0.15);
      startPoint = new Point(startPointX, startPointY);
    } else {
      startPoint = position;
    }

    let numberOfFile = object.length;
    for(let i = 0; i < numberOfFile; i++){
      switch (object.item(i).type) {
        case "image/jpeg":
        case "image/gif":
        case "image/png":
          //console.log("ImportFileService >> importFile >> object.type : ", object.item(i).type);
          this.drawImage(object.item(i), sumWidth, startPoint);

          break;
        case "application/pdf":
          //console.log("ImportFileService >> importFile >> object : ", object.item(i));
          //console.log("ImportFileService >> importFile >> object.type : ", object.item(i).type);
          break;
        default:
          break;
      }
    }
  }

  drawImage(imageObject: File, sumWidth: { value }, startPoint: Point) {
    let reader = new FileReader();
    let base64Image: string;
    let raster: Raster;

    reader.readAsDataURL(imageObject);
    reader.onload = () => {
      // @ts-ignore
      base64Image = reader.result;
      raster = new Raster(base64Image);

      raster.onLoad = () => {
        raster.bounds.topLeft = new Point(startPoint.x + sumWidth.value, startPoint.y); // raster bounds.topLeft 왜 안먹지?
        sumWidth.value += raster.width + 10;

        this.layerService.addToDrawingLayer(raster, WhiteboardItemType.SIMPLE_RASTER);
      };
    };
  }

}
