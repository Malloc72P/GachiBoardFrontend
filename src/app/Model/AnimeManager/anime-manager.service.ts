import {Injectable, Renderer2, RendererFactory2} from '@angular/core';

export enum AnimeName{
  UNAVAILABLE,
  NOTHING,
}

@Injectable({
  providedIn: 'root'
})
export class AnimeManagerService {
  private readonly animeHead = "do-anime-";
  private readonly animeNameEnum = AnimeName;
  private renderer2:Renderer2;
  constructor(
    rendererFactory2:RendererFactory2
  ) {
    this.renderer2 = rendererFactory2.createRenderer(null,null);
  }
  public doAnime(el:HTMLElement, animeEnum){
    let animeRealName = this.animeHead + this.animeNameEnum[animeEnum].toLowerCase();
    switch (animeEnum) {
      case AnimeName.UNAVAILABLE :
        break;
      case AnimeName.NOTHING :
        break;
      default :
    }
    this.renderer2.addClass( el, animeRealName );
    setTimeout(()=>{
      console.log("AnimeManagerService >> setTimeOut >> 진입함");
      this.renderer2.removeClass( el, animeRealName );
    }, 1200)
  }

  activateSplashAnime(el){

    let originX = el.offsetParent.offsetWidth;

    let gapBetweenOriginX = originX -  el.offsetLeft;
    this.renderer2.setStyle( el, "transition", "0s" );
    this.renderer2.setStyle( el, "transform", `translate( ${gapBetweenOriginX}px,  0px)` );
    this.renderer2.setStyle( el, "opacity", 0 );
    setTimeout(()=>{
      this.renderer2.setStyle( el, "transition", "0.2s cubic-bezier(1,.25,0,.99)" );
      this.renderer2.setStyle( el, "opacity", 1 );
      this.renderer2.setStyle( el, "transform", `translate( 0px,  0px)` );
    },10);
  }

}
