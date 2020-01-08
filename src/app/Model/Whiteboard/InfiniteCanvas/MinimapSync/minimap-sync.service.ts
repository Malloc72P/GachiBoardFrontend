import {EventEmitter, Injectable, Output} from '@angular/core';
// @ts-ignore
import Path = paper.Path;
// @ts-ignore
import Point = paper.Point;
// @ts-ignore
import PointText = paper.PointText;
// @ts-ignore
import Group = paper.Group;
// @ts-ignore
import Project = paper.Project;
// @ts-ignore
import Rectangle = paper.Path.Rectangle;
// @ts-ignore
import Circle = paper.Path.Circle;
// @ts-ignore
import Layer = paper.Layer;
import {DataType} from '../../../Helper/data-type-enum/data-type.enum';
@Injectable({
  providedIn: 'root'
})
export class MinimapSyncService {
  private currentProject;
  @Output() changeMinimap:EventEmitter<any> = new EventEmitter<any>();
  constructor() {

  }
  public initializePositionCalcService( currentProject: Project ){
    this.currentProject = currentProject;
  }
  public syncMinimap(){
    this.currentProject.layers.forEach((value)=>{
      if(value.data.type == DataType.DRAWING_CANVAS){
        this.changeMinimap.emit(value.exportJSON());
      }
    });
  }

}
