import {Component, Inject, Input, OnInit} from '@angular/core';
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
import {DrawingLayerManagerService} from '../../../Model/Whiteboard/InfiniteCanvas/DrawingLayerManager/drawing-layer-manager.service';

class MinimapElement{
  id;
  areaRect:Rectangle;
  constructor(id, rect){
    this.id = id;
    this.areaRect = rect;
  }
}

@Component({
  selector: 'app-whiteboard-minimap',
  templateUrl: './whiteboard-minimap.component.html',
  styleUrls: ['./whiteboard-minimap.component.css']
})
export class WhiteboardMinimapComponent implements OnInit {
  @Input() currentProject: Project;

  public elem;
  public htmlCanvasObject: HTMLCanvasElement;
  public htmlCanvasObjectWrapper: HTMLDivElement;
  public minimapScope;

  public mapLayer;
  public cursorLayer;

  public isFullScreen = false;
  public minimapElMap:Map<number,MinimapElement>;

  constructor(
    public infiniteCanvasService:InfiniteCanvasService,
    public zoomControlService:ZoomControlService,
    public posCalcService:PositionCalcService,
    public minimapSyncService: MinimapSyncService,
    public layerService: DrawingLayerManagerService,
    @Inject(DOCUMENT) public document: any
  ) {
    this.minimapSyncService.changeMinimap.subscribe(()=>{

      if(this.minimapScope){
        //this.minimapScope.activate();

        this.mapLayer.removeChildren();


        let originChildren = this.layerService.whiteboardItemArray;

        for(let i = originChildren.length - 1 ; i >= 0 ; i-- ){
          let originEl = originChildren[i].group;
          let newRect = new Rectangle(originEl.bounds);
          // @ts-ignore
          newRect.fillColor = "blue";
          newRect.opacity = 0.1;

          this.mapLayer.addChild(newRect);
        }

        this.mapLayer.addChild(this.createUserViewRect());
        this.mapLayer.fitBounds(this.minimapScope.view.bounds);

        //this.currentProject.activate();
      }
    });
    this.minimapElMap = new Map<number, MinimapElement>();
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
    this.minimapScope = new PaperScope();
    this.htmlCanvasObject = document.getElementById("gachi-minimap") as HTMLCanvasElement;
    this.htmlCanvasObjectWrapper = document.getElementById("gachi-minimap-wrapper") as HTMLDivElement;
    this.minimapScope.setup(this.htmlCanvasObject);
    //this.minimapScope.activate();

    let mapLayer = new Layer();
    mapLayer.data.type = DataType.MINIMAP_MAP_LAYER;

    let cursorLayer = new Layer();
    cursorLayer.data.type = DataType.MINIMAP_CURSOR_LAYER;

    this.minimapScope.project.addLayer(mapLayer);
    this.minimapScope.project.addLayer(cursorLayer);

    this.cursorLayer = cursorLayer;
    this.mapLayer = mapLayer;

    //this.currentProject.activate();
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
