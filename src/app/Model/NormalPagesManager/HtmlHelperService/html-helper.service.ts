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
  getKanbanGroupSettingPanelHeight(){
    return this.getHeightOfBrowser() - this.getHeightOfBrowser() * 0.2;
  }
  getProjectEditPanelHeight(){
    return this.getHeightOfBrowser() - this.getHeightOfBrowser() * 0.2;
  }
  generateRand(min, max) {
    min = Math.ceil(min);
    max = Math.floor(max);
    return Math.floor(Math.random() * (max - min + 1)) + min; //최댓값도 포함, 최솟값도 포함
  }
  verifyProfileImage(profileImg){
    if(profileImg){
      return profileImg;
    }else return "/assets/images/supporter/kanban/male.jpg";
  }
}
