import {AfterViewInit, Component, Input, OnInit, ViewChild} from '@angular/core';
import {AnimeManagerService} from '../../../../../Model/AnimeManager/anime-manager.service';

@Component({
  selector: 'app-whiteboard-card',
  templateUrl: './whiteboard-card.component.html',
  styleUrls: ['./whiteboard-card.component.css', './../../../gachi-font.css']
})
export class WhiteboardCardComponent implements OnInit, AfterViewInit {
  @ViewChild('wbCard', {static: false}) wbCard;
  @Input()marginValue = '0px';
  private isHovering = false;

  constructor(
    private animeManagerService:AnimeManagerService
  ) { }

  ngOnInit() {
  }
  ngAfterViewInit(): void {
    this.animeManagerService.activateSplashAnime(this.wbCard.nativeElement);

  }

}
