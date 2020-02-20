import {AfterViewInit, Component, Input, OnChanges, OnInit, Renderer2, SimpleChanges, ViewChild} from '@angular/core';
import {HtmlHelperService} from '../../../../../Model/NormalPagesManager/HtmlHelperService/html-helper.service';
import {AnimeManagerService} from '../../../../../Model/AnimeManager/anime-manager.service';

@Component({
  selector: 'app-user-overlay-card',
  templateUrl: './user-overlay-card.component.html',
  styleUrls: ['./user-overlay-card.component.css', './../../../gachi-font.css']
})
export class UserOverlayCardComponent implements OnInit, AfterViewInit,OnChanges {
  @Input()isHovering = true;
  @Input()imgSrc = "/assets/images/supporter/kanban/male.jpg";
  @Input()userName = 'unknown';
  @Input()marginValue = '0px';
  @Input()imgSize = '64px';
  @Input()fontColor = 'black';
  @Input()fontSize = '14px';
  @Input()enableDropShadow = true;
  @Input()dropShadowColor = 'black';
  @Input()enableSpashAnime = false;

  @ViewChild('overlayEl', {static: false}) userOverlay;

  private userOverlayEl;

  constructor(
    private renderer: Renderer2,
    private animeManagerService:AnimeManagerService
  ) { }

  ngOnInit() {
  }
  ngAfterViewInit(): void {
    this.userOverlayEl = this.userOverlay.nativeElement;
  }

  ngOnChanges(changes: SimpleChanges): void {
    if(this.isHovering && this.enableSpashAnime){
      //this.activateAnime();
      this.animeManagerService.activateSplashAnime(this.userOverlayEl);
    }
  }

  activateAnime(){

    let originX = this.userOverlayEl.offsetParent.offsetWidth;

    let gapBetweenOriginX = originX -  this.userOverlayEl.offsetLeft;
    this.renderer.setStyle( this.userOverlayEl, "transition", "0s" );
    this.renderer.setStyle( this.userOverlayEl, "transform", `translate( ${gapBetweenOriginX}px,  0px)` );
    this.renderer.setStyle( this.userOverlayEl, "opacity", 0 );
    setTimeout(()=>{
      this.renderer.setStyle( this.userOverlayEl, "transition", "0.2s cubic-bezier(1,.25,0,.99)" );
      this.renderer.setStyle( this.userOverlayEl, "opacity", 1 );
      this.renderer.setStyle( this.userOverlayEl, "transform", `translate( 0px,  0px)` );
    },10);
  }



}
