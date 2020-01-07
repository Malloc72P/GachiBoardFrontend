import { Component, OnInit } from '@angular/core';
import {PointerModeManagerService} from "../../Model/Whiteboard/Pointer/pointer-mode-manager-service/pointer-mode-manager.service";
import {InfiniteCanvasService} from "../../Model/Whiteboard/InfiniteCanvas/infinite-canvas.service";
import {PositionCalcService} from "../../Model/Whiteboard/PositionCalc/position-calc.service";
import {PanelManagerService} from "../../Model/Whiteboard/Panel/panel-manager-service/panel-manager.service";
import {ZoomControlService} from "../../Model/Whiteboard/InfiniteCanvas/ZoomControl/zoom-control.service";
import * as paper from 'paper';
// @ts-ignore
import Project = paper.Project;
// @ts-ignore
import Point = paper.Point;
// @ts-ignore
import Size = paper.Size;
// @ts-ignore
import Path = paper.Path;
import {DebugingService} from "../../Model/Helper/DebugingHelper/debuging.service";
@Component({
  selector: 'app-debuging-pannel',
  templateUrl: './debuging-pannel.component.html',
  styleUrls: ['./debuging-pannel.component.css']
})
export class DebugingPannelComponent implements OnInit {

  private paperProject;
  constructor(
    private pointerModeManager      : PointerModeManagerService,
    private infiniteCanvasService   : InfiniteCanvasService,
    private posCalcService          : PositionCalcService,
    private zoomControlService      : ZoomControlService,
    private debugingService         : DebugingService,
  ) { }

  ngOnInit() {
    this.paperProject = paper.project;
  }


}
