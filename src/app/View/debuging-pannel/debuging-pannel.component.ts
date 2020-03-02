import {Component, Input, OnInit} from '@angular/core';
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
import {WorkHistoryManager} from '../../Model/Whiteboard/InfiniteCanvas/DrawingLayerManager/WorkHistoryManager/work-history-manager';
import {WbItemWork} from '../../Model/Whiteboard/InfiniteCanvas/DrawingLayerManager/WorkHistoryManager/WbItemWork/wb-item-work';
import {ItemLifeCycleEnum} from '../../Model/Whiteboard/Whiteboard-Item/WhiteboardItemLifeCycle/WhiteboardItemLifeCycle';
@Component({
  selector: 'app-debuging-pannel',
  templateUrl: './debuging-pannel.component.html',
  styleUrls: ['./debuging-pannel.component.css']
})
export class DebugingPannelComponent implements OnInit {
  @Input() paperProject;
  constructor(
    public pointerModeManager      : PointerModeManagerService,
    public infiniteCanvasService   : InfiniteCanvasService,
    public posCalcService          : PositionCalcService,
    public zoomControlService      : ZoomControlService,
    public debugingService         : DebugingService,
  ) { }

  public undoStack:Array<WbItemWork> = new Array<WbItemWork>();
  public redoStack:Array<WbItemWork> = new Array<WbItemWork>();


  public workHistoryManager:WorkHistoryManager = null;
  ngOnInit() {
    this.workHistoryManager = WorkHistoryManager.getInstance();

    this.undoStack = this.workHistoryManager.undoStack;
    this.redoStack = this.workHistoryManager.redoStack;
  }

  getNameOfHistoryEnum(workAction:ItemLifeCycleEnum){
    return ItemLifeCycleEnum[workAction] + " [" + workAction + "]";
  }


}
