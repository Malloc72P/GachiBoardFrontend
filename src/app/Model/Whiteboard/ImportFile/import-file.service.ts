import * as paper from 'paper';
// @ts-ignore
import Raster = paper.Raster;
// @ts-ignore
import Point = paper.Point;

import {Injectable} from '@angular/core';
import {PositionCalcService} from "../PositionCalc/position-calc.service";
import {DrawingLayerManagerService} from '../InfiniteCanvas/DrawingLayerManager/drawing-layer-manager.service';
import {WhiteboardItemType} from '../../Helper/data-type-enum/data-type.enum';
import {CommonSnackbarService} from "../../NormalPagesManager/common-snackbar/common-snackbar.service";

@Injectable({
  providedIn: 'root'
})
export class ImportFileService {

  constructor(
    private positionCalcService: PositionCalcService,
    private layerService: DrawingLayerManagerService,
    private snackBar: CommonSnackbarService,
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
          if(object.item(i).size / Math.pow(1024, 2) > 4) {
            this.snackBar.openSnackBar("4MB 이하의 파일만 화이트보드에 불러올 수 있습니다.", "close");
            break;
          }
          this.drawImage(object.item(i), sumWidth, startPoint);
          break;
        case "application/pdf":
          break;
        case "application/json":
          this.importFromJson(object.item(i));
          break;
        default:
          break;
      }
    }
  }

  private drawImage(imageObject: File, sumWidth: { value }, startPoint: Point) {
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
        sumWidth.value += raster.width + 30;

        this.layerService.addToDrawingLayer(raster, WhiteboardItemType.SIMPLE_RASTER);
      };
    };
  }

  private importFromJson(backupJsonFile: File) {
    const reader = new FileReader();
    reader.readAsText(backupJsonFile, 'UTF-8');
    reader.onload = () => {
      if (typeof reader.result === "string") {
        try {
          this.layerService.globalSelectedGroup.doPaste(null, JSON.parse(reader.result));
        } catch (e) {
          console.error("ImportFileService >> onload >> e : ", e);
          this.snackBar.openSnackBar("손상된 백업 파일입니다.", "close");
        }
      } else {
        this.snackBar.openSnackBar("손상된 백업 파일입니다.", "close");
      }
    };
    reader.onerror = (error) => {
      console.error(error);
      this.snackBar.openSnackBar("손상된 백업 파일입니다.", "close");
    };
  }
}
