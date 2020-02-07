import { Injectable } from '@angular/core';

@Injectable({
  providedIn: 'root'
})
export class HtmlHelperService {

  constructor() {

  }

  offset(el){
    let rect = el.getBoundingClientRect();

    return {
        top: rect.top + document.body.scrollTop,
        left: rect.left + document.body.scrollLeft
    }
  }

  width(el){
    return parseFloat(getComputedStyle(el, null).width.replace("px", ""))
  }
  height(el){
    return parseFloat(getComputedStyle(el, null).height.replace("px", ""))
  }
}
