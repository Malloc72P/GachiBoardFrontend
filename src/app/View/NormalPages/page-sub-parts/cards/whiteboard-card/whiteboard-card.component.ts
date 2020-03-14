import {AfterViewInit, Component, Input, OnDestroy, OnInit, ViewChild} from '@angular/core';
import {AnimeManagerService} from '../../../../../Model/AnimeManager/anime-manager.service';
import {WhiteboardSessionDto} from '../../../../../DTO/ProjectDto/WhiteboardSessionDto/whiteboard-session-dto';
import {WebsocketManagerService} from '../../../../../Controller/Controller-WebSocket/websocket-manager/websocket-manager.service';
import {RouterHelperService} from '../../../../../Model/Helper/router-helper-service/router-helper.service';
import {
  EditWbSessionComponent,
  EditWbSessionComponentData
} from '../../../main-page/main-page-project/edit-wb-session/edit-wb-session.component';
import {MatDialog} from '@angular/material/dialog';
import {
  WbSessionEvent,
  WbSessionEventEnum
} from '../../../../../Controller/Controller-WebSocket/websocket-manager/WhiteboardSessionWsController/wb-session-event/wb-session-event';
import {Subscription} from 'rxjs';

@Component({
  selector: 'app-whiteboard-card',
  templateUrl: './whiteboard-card.component.html',
  styleUrls: ['./whiteboard-card.component.css', './../../../gachi-font.css']
})
export class WhiteboardCardComponent implements OnInit, AfterViewInit, OnDestroy {
  @ViewChild('wbCard') wbCard;
  @Input()marginValue = '0px';
  @Input()whiteboardSession:WhiteboardSessionDto;
  @Input()projectId;
  public isHovering = false;

  private subscriptionList:Array<Subscription> = new Array<Subscription>();

  constructor(
    public animeManagerService:AnimeManagerService,
    public websocketManagerService:WebsocketManagerService,
    public routerService:RouterHelperService,
    public dialog: MatDialog,
  ) {
    let subscription = this.websocketManagerService.wbSessionEventManagerService.wsWbSessionEventEmitter
      .subscribe((wbSessionEvent:WbSessionEvent)=>{
        console.log("WhiteboardCardComponent >>  >> wbSessionEvent : ",wbSessionEvent);
        switch (wbSessionEvent.action) {
          case WbSessionEventEnum.DELETE:
            break;
          case WbSessionEventEnum.UPDATE:
            this.onUpdate(wbSessionEvent);
            break;
          case WbSessionEventEnum.READ:
            break;
          case WbSessionEventEnum.JOIN:
            this.onJoin(wbSessionEvent);
            break;
          case WbSessionEventEnum.DISCONNECT:
            this.onDisconnect(wbSessionEvent);
            break;
          case WbSessionEventEnum.UPDATE_CURSOR:
            break;
        }

      },(error)=>{
        console.warn("WhiteboardCardComponent >> constructor >> error : ",error);
    });
    this.subscriptionList.push(subscription);
  }
  onJoin(wbSessionEvent:WbSessionEvent){
    console.log("WhiteboardCardComponent >> onJoin >> wbSessionEvent : ",wbSessionEvent);
    let recvWbSessionDto:WhiteboardSessionDto = wbSessionEvent.data as WhiteboardSessionDto;
    if(this.whiteboardSession._id === recvWbSessionDto._id){
      this.whiteboardSession.connectedUsers = recvWbSessionDto.connectedUsers;
    }
  }
  onDisconnect(wbSessionEvent:WbSessionEvent){
    console.log("WhiteboardCardComponent >> onDisconnect >> wbSessionEvent : ",wbSessionEvent);
    let wbSessionId = wbSessionEvent.additionalData;
    let disconnectedUserIdToken = wbSessionEvent.data;

    if(this.whiteboardSession._id === wbSessionId){
      let delIdx = this.whiteboardSession.connectedUsers.length;
      while (delIdx--){
        let connectedUser = this.whiteboardSession.connectedUsers[delIdx];
        if(connectedUser === disconnectedUserIdToken){
          this.whiteboardSession.connectedUsers.splice(delIdx);
        }
      }
    }
  }
  onUpdate(wbSessionEvent:WbSessionEvent){
    let recvWbSessionDto:WhiteboardSessionDto = wbSessionEvent.data as WhiteboardSessionDto;
    if (this.whiteboardSession._id === recvWbSessionDto._id){
      this.whiteboardSession.title = recvWbSessionDto.title;
    }
  }

  ngOnInit() {
  }
  ngOnDestroy(): void {
    for(let subscription of this.subscriptionList){
      if(subscription){
        subscription.unsubscribe();
      }
    }
  }

  ngAfterViewInit(): void {
    // this.animeManagerService.activateSplashAnime(this.wbCard.nativeElement);

  }
  onWbCardClick(){
    this.routerService.goToWhiteboardPage(this.projectId, this.whiteboardSession._id);
  }
  onEditWbSessionBtnClick(){
    const dialogRef = this.dialog.open(EditWbSessionComponent, {
      width: '480px',
      data: new EditWbSessionComponentData(this.whiteboardSession)
    });

    dialogRef.afterClosed().subscribe((result) => {

    });
  }
  onDeleteWbSessionBtnClick(){
    console.log("WhiteboardCardComponent >> onDeleteWbSessionBtnClick >> this.whiteboardSession : ",this.whiteboardSession);
    if(this.whiteboardSession.connectedUsers.length <= 0){

    }
  }

}
