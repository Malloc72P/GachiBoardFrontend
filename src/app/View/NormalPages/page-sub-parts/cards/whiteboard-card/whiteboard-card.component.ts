import {AfterViewInit, Component, Input, OnInit, ViewChild} from '@angular/core';
import {AnimeManagerService} from '../../../../../Model/AnimeManager/anime-manager.service';
import {WhiteboardSessionDto} from '../../../../../DTO/ProjectDto/WhiteboardSessionDto/whiteboard-session-dto';
import {WebsocketManagerService} from '../../../../../Controller/Controller-WebSocket/websocket-manager/websocket-manager.service';
import {RouterHelperService} from '../../../../../Model/Helper/router-helper-service/router-helper.service';

@Component({
  selector: 'app-whiteboard-card',
  templateUrl: './whiteboard-card.component.html',
  styleUrls: ['./whiteboard-card.component.css', './../../../gachi-font.css']
})
export class WhiteboardCardComponent implements OnInit, AfterViewInit {
  @ViewChild('wbCard') wbCard;
  @Input()marginValue = '0px';
  @Input()whiteboardSession:WhiteboardSessionDto;
  @Input()projectId;
  public isHovering = false;

  constructor(
    public animeManagerService:AnimeManagerService,
    public websocketManagerService:WebsocketManagerService,
    public routerService:RouterHelperService,

  ) { }

  ngOnInit() {
  }
  ngAfterViewInit(): void {
    // this.animeManagerService.activateSplashAnime(this.wbCard.nativeElement);

  }
  onWbCardClick(){
    this.routerService.goToWhiteboardPage(this.projectId, this.whiteboardSession._id);
  }

}
