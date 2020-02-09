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

  getWidthOfBrowser() {
    return Math.max(
      document.body.scrollWidth,
      document.documentElement.scrollWidth,
      document.body.offsetWidth,
      document.documentElement.offsetWidth,
      document.documentElement.clientWidth
    );
  }

  getHeightOfBrowser() {
    return Math.max(
      document.body.scrollHeight,
      document.documentElement.scrollHeight,
      document.body.offsetHeight,
      document.documentElement.offsetHeight,
      document.documentElement.clientHeight
    );
  }
}
