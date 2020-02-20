import {AfterViewInit, Component, Input, OnInit, ViewChild} from '@angular/core';
import {AnimeManagerService} from '../../../../../Model/AnimeManager/anime-manager.service';

@Component({
  selector: 'app-whiteboard-card',
  templateUrl: './whiteboard-card.component.html',
  styleUrls: ['./whiteboard-card.component.css', './../../../gachi-font.css']
})
export class WhiteboardCardComponent implements OnInit, AfterViewInit {
  @ViewChild('wbCard') wbCard;
  @Input()marginValue = '0px';
  public isHovering = false;

  constructor(
    public animeManagerService:AnimeManagerService
  ) { }

  ngOnInit() {
  }
  ngAfterViewInit(): void {
    this.animeManagerService.activateSplashAnime(this.wbCard.nativeElement);

  }

}
