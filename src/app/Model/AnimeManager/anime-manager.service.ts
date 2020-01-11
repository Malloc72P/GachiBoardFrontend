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
}
