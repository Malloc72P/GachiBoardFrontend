import { Injectable } from '@angular/core';

import * as paper from 'paper';
// @ts-ignore
import Raster = paper.Raster;
// @ts-ignore
import Project = paper.Project;
// @ts-ignore
import Point = paper.Point;
import {PositionCalcService} from "../PositionCalc/position-calc.service";

@Injectable({
  providedIn: 'root'
})
export class ImportFileService {

  constructor(
    private positionCalcService: PositionCalcService,
  ) { }

  drawImage(imageObject: File) {
    let reader = new FileReader();
    let base64Image: string;

    reader.readAsDataURL(imageObject);

    reader.onload = () => {
      // @ts-ignore
      base64Image = reader.result;
      let raster = new Raster(base64Image);
      raster.position = this.positionCalcService.getCenterOfPaperView();
    };
  }
}
