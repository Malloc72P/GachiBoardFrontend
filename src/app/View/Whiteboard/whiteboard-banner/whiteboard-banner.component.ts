import {Component, Input, OnChanges, OnDestroy, OnInit, SimpleChanges} from '@angular/core';
import {CursorData} from '../../../DTO/ProjectDto/WhiteboardSessionDto/Cursor-Data/Cursor-Data';
import {WebsocketManagerService} from '../../../Controller/Controller-WebSocket/websocket-manager/websocket-manager.service';
import {CursorTrackerService} from '../../../Model/Whiteboard/CursorTracker/cursor-tracker-service/cursor-tracker.service';
import {DrawingLayerManagerService} from '../../../Model/Whiteboard/InfiniteCanvas/DrawingLayerManager/drawing-layer-manager.service';
import {InfiniteCanvasService} from '../../../Model/Whiteboard/InfiniteCanvas/infinite-canvas.service';
import * as paper from 'paper';
// @ts-ignore
import Point = paper.Point;
import {WbSessionEventManagerService} from '../../../Controller/Controller-WebSocket/websocket-manager/WhiteboardSessionWsController/wb-session-event-manager.service';
import {
  WbSessionEvent,
  WbSessionEventEnum
} from '../../../Controller/Controller-WebSocket/websocket-manager/WhiteboardSessionWsController/wb-session-event/wb-session-event';
import {Subscription} from 'rxjs';

@Component({
  selector: 'app-whiteboard-banner',
  templateUrl: './whiteboard-banner.component.html',
  styleUrls: ['./whiteboard-banner.component.css', '../../NormalPages/gachi-font.css']
})
export class WhiteboardBannerComponent implements OnInit,OnDestroy {
  @Input()connectedUserList:Array<string>;
  @Input()wbTitle:string;
  @Input()wbSessionId:string;
  constructor(
    public websocketManagerService:WebsocketManagerService,
    public cursorTrackerService:CursorTrackerService,
    public layerService:DrawingLayerManagerService,
    public infiniteCanvasService:InfiniteCanvasService,
    public wbSessionEventManager:WbSessionEventManagerService,
  ) { }

  private subscription:Subscription;
  ngOnInit(): void {
    this.subscription = this.wbSessionEventManager.wsWbSessionEventEmitter.subscribe((recvEvent:WbSessionEvent)=>{
      switch (recvEvent.action) {
        case WbSessionEventEnum.JOIN:
          break;
        case WbSessionEventEnum.DISCONNECT:
          console.log("WhiteboardBannerComponent >> WbSessionEvent >> recvEvent : ",recvEvent);
          this.onUserDisconnect(recvEvent.data, recvEvent.additionalData);
          break;
      }
    })
  }
  ngOnDestroy(): void {
    if(this.subscription){
      this.subscription.unsubscribe();
    }
  }
  onUserDisconnect(idToken, wbSessionId){
    if(wbSessionId !== this.wbSessionId){
      return;
    }
    for(let i = 0 ; i < this.connectedUserList.length; i++){
      let currUser = this.connectedUserList[i];
      if(currUser === idToken){
        this.connectedUserList.splice(i, 1);
      }
    }
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
