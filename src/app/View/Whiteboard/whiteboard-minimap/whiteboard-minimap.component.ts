import {Component, Inject, OnInit} from '@angular/core';
import {ZoomControlService} from '../../../Model/Whiteboard/InfiniteCanvas/ZoomControl/zoom-control.service';
import {InfiniteCanvasService} from '../../../Model/Whiteboard/InfiniteCanvas/infinite-canvas.service';
import {PositionCalcService} from '../../../Model/Whiteboard/PositionCalc/position-calc.service';
import {DOCUMENT} from '@angular/common';
import * as paper from 'paper';
// @ts-ignore
import Project = paper.Project;
// @ts-ignore
import PaperScope = paper.PaperScope;
// @ts-ignore
import Point = paper.Point;
// @ts-ignore
import Size = paper.Size;
// @ts-ignore
import Path = paper.Path;
// @ts-ignore
import Circle = paper.Shape.Circle;
import {MinimapSyncService} from '../../../Model/Whiteboard/InfiniteCanvas/MinimapSync/minimap-sync.service';
// @ts-ignore
import Circle = paper.Path.Circle;
// @ts-ignore
import Rectangle = paper.Path.Rectangle;
// @ts-ignore
import Layer = paper.Layer;
import {DataType} from '../../../Model/Helper/data-type-enum/data-type.enum';

@Component({
  selector: 'app-whiteboard-minimap',
  templateUrl: './whiteboard-minimap.component.html',
  styleUrls: ['./whiteboard-minimap.component.css']
})
export class WhiteboardMinimapComponent implements OnInit {
  private elem;
  private htmlCanvasObject: HTMLCanvasElement;
  private htmlCanvasObjectWrapper: HTMLDivElement;
  private currentProject;
  private minimapProject;

  private maplayer;
  private cursorLayer;

  private isFullScreen = false;

  constructor(
    private infiniteCanvasService:InfiniteCanvasService,
    private zoomControlService:ZoomControlService,
    private posCalcService:PositionCalcService,
    private minimapSyncService: MinimapSyncService,
    @Inject(DOCUMENT) private document: any
  ) {
    this.minimapSyncService.changeMinimap.subscribe((projectData)=>{

      if(this.minimapProject){
        this.minimapProject.activate();

        this.maplayer.removeChildren();
        let tempRaster = projectData.exportJSON();
        //this.maplayer.addChild(tempRaster);
        this.maplayer.importJSON(tempRaster);

        this.maplayer.children.forEach((value)=>{
          if(value.data.type !== DataType.MINIMAP_USER_VIEW){
            value.style.strokeWidth = value.style.strokeWidth / 5;
          }
        });

        this.maplayer.addChild(this.createUserViewRect());
        this.maplayer.fitBounds(this.minimapProject.view.bounds);

        this.currentProject.activate();
      }
    });
  }

  createUserViewRect(){
    let userViewRect = new paper.Shape.Rectangle(this.currentProject.view.bounds);
    // @ts-ignore
    userViewRect.data.type = DataType.MINIMAP_USER_VIEW;
    // @ts-ignore
    userViewRect.strokeColor = "black";
    // @ts-ignore
    userViewRect.strokeWidth = 5;
    return userViewRect;
  }

  ngOnInit() {

    this.elem = document.documentElement;
    this.currentProject = paper;
    this.minimapProject = new PaperScope();
    this.htmlCanvasObject = document.getElementById("gachi-minimap") as HTMLCanvasElement;
    this.htmlCanvasObjectWrapper = document.getElementById("gachi-minimap-wrapper") as HTMLDivElement;
    this.minimapProject.setup(this.htmlCanvasObject);

    let mapLayer = new Layer();
    mapLayer.data.type = DataType.MINIMAP_MAP_LAYER;

    let cursorLayer = new Layer();
    cursorLayer.data.type = DataType.MINIMAP_CURSOR_LAYER;

    this.minimapProject.project.addLayer(mapLayer);
    this.minimapProject.project.addLayer(cursorLayer);

    this.cursorLayer = cursorLayer;
    this.maplayer = mapLayer;

    this.currentProject.activate();
  }

  toggleFullScreen(){
    if(this.isFullScreen){
      this.closeFullscreen();
      this.isFullScreen = false;
    }
    else{
      this.openFullscreen();
      this.isFullScreen = true;
    }

  }

  openFullscreen() {
    if (this.elem.requestFullscreen) {
      this.elem.requestFullscreen();
    } else if (this.elem.mozRequestFullScreen) {
      /* Firefox */
      this.elem.mozRequestFullScreen();
    } else if (this.elem.webkitRequestFullscreen) {
      /* Chrome, Safari and Opera */
      this.elem.webkitRequestFullscreen();
    } else if (this.elem.msRequestFullscreen) {
      /* IE/Edge */
      this.elem.msRequestFullscreen();
    }
  }

  /* Close fullscreen */
  closeFullscreen() {
    if (this.document.exitFullscreen) {
      this.document.exitFullscreen();
    } else if (this.document.mozCancelFullScreen) {
      /* Firefox */
      this.document.mozCancelFullScreen();
    } else if (this.document.webkitExitFullscreen) {
      /* Chrome, Safari and Opera */
      this.document.webkitExitFullscreen();
    } else if (this.document.msExitFullscreen) {
      /* IE/Edge */
      this.document.msExitFullscreen();
    }
  }

}
