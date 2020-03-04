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
import {DrawingLayerManagerService} from '../../Model/Whiteboard/InfiniteCanvas/DrawingLayerManager/drawing-layer-manager.service';
import {WhiteboardItem} from '../../Model/Whiteboard/Whiteboard-Item/whiteboard-item';
import {WhiteboardItemType} from '../../Model/Helper/data-type-enum/data-type.enum';
@Component({
  selector: 'app-debuging-pannel',
  templateUrl: './debuging-pannel.component.html',
  styleUrls: ['./debuging-pannel.component.css', '../NormalPages/gachi-font.css']
})
export class DebugingPannelComponent implements OnInit {
  @Input() paperProject;

  private readonly SMALL_DEBUGGER_WIDTH = 250;
  private readonly LARGE_DEBUGGER_WIDTH = 600;
  debuggerWidth = this.LARGE_DEBUGGER_WIDTH;

  private testMap:Map<any, Array<any>> = new Map<any, Array<any>>();

  constructor(
    public pointerModeManager      : PointerModeManagerService,
    public infiniteCanvasService   : InfiniteCanvasService,
    public posCalcService          : PositionCalcService,
    public zoomControlService      : ZoomControlService,
    public debugingService         : DebugingService,
    public layerService         : DrawingLayerManagerService,
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

  setMap(){
    if (!this.testMap.has(1)) {
      this.testMap.set( 1, new Array<any>() );
    }
    this.testMap.get(1).push(Math.random());
  }

  showMap(){
    console.log("\n\n===============\n");
    console.log("DebugingPannelComponent >> showMap >> idMap : ",this.workHistoryManager.idMap);
    console.log("\n===============\n\n");
  }

  private testArr:Array<any> = new Array<any>();
  doSortingTest(){
    this.testArr.splice(0, this.testArr.length);

    this.testArr.push(Math.random()*100);
    this.testArr.push(Math.random()*100);
    this.testArr.push(Math.random()*100);
    this.testArr.push(Math.random()*100);
    this.testArr.push(Math.random()*100);

    this.testArr.sort((prev, next)=>{
      if(prev < next){
        return -1;
      }else return 1;
    })


  }

  changeDebuggerSize(){
    if(this.debuggerWidth === this.SMALL_DEBUGGER_WIDTH){
      this.debuggerWidth = this.LARGE_DEBUGGER_WIDTH;
    }else this.debuggerWidth = this.SMALL_DEBUGGER_WIDTH;
  }

  getWbItemTypeName(typeNumber:WhiteboardItemType){
    return WhiteboardItemType[typeNumber];
  }


}
