import {Component, Input, OnChanges, OnInit, SimpleChanges} from '@angular/core';
import {CursorData} from '../../../DTO/ProjectDto/WhiteboardSessionDto/Cursor-Data/Cursor-Data';
import {WebsocketManagerService} from '../../../Controller/Controller-WebSocket/websocket-manager/websocket-manager.service';
import {CursorTrackerService} from '../../../Model/Whiteboard/CursorTracker/cursor-tracker-service/cursor-tracker.service';
import {DrawingLayerManagerService} from '../../../Model/Whiteboard/InfiniteCanvas/DrawingLayerManager/drawing-layer-manager.service';
import {InfiniteCanvasService} from '../../../Model/Whiteboard/InfiniteCanvas/infinite-canvas.service';
import * as paper from 'paper';
// @ts-ignore
import Point = paper.Point;

@Component({
  selector: 'app-whiteboard-banner',
  templateUrl: './whiteboard-banner.component.html',
  styleUrls: ['./whiteboard-banner.component.css', '../../NormalPages/gachi-font.css']
})
export class WhiteboardBannerComponent implements OnInit {
  @Input()connectedUserList:Array<string>;
  @Input()wbTitle:string;
  constructor(
    public websocketManagerService:WebsocketManagerService,
    public cursorTrackerService:CursorTrackerService,
    public layerService:DrawingLayerManagerService,
    public infiniteCanvasService:InfiniteCanvasService,
  ) { }

  ngOnInit(): void {
  }

  onUserImageClick(idToken){
    if(idToken === this.websocketManagerService.userInfo.idToken){
      return;
    }
    let userCursor = this.cursorTrackerService.userCursorMap.get(idToken);
    console.log("WhiteboardBannerComponent >> onUserImageClick >> userCursor : ",userCursor);
    let currentProject = this.layerService.currentProject;
    let deltaX = currentProject.view.bounds.center.x - userCursor.position.x;
    let deltaY = currentProject.view.bounds.center.y - userCursor.position.y;
    this.infiniteCanvasService.moveWithDelta(new Point(deltaX, deltaY));
    this.infiniteCanvasService.resetInfiniteCanvas();
  }

}