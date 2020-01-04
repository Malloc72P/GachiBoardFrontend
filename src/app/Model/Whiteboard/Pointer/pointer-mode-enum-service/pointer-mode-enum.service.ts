import { Injectable } from '@angular/core';
import {CommonEnum} from '../../../Helper/common-enum/common-enum';

export enum PointerMode {
  MOVE,
  DRAW,
  ERASER,
  LASSO_SELECTOR,
}

// /View\Whiteboard\whiteboard-tool-panel\whiteboard-tool-panel.component.css 에
// 등록한 클래스 'icon-tools-***' ***을 넣을것
export enum PointerIcon {
  move,
  brush,
  eraser,
  selector,
}

@Injectable({
  providedIn: 'root'
})

export class PointerModeEnumService implements CommonEnum {
  private enumData = PointerMode;
  private selectableMode:Array<any>;

  constructor() {
    this.selectableMode = new Array<any>();

    for( let key in this.enumData ){
      let iterItem = this.enumData[key];
      if(!isNaN(Number(iterItem))){
        this.selectableMode.splice(this.selectableMode.length, 0, iterItem);
      }
    }
  }
  getEnumEntryArray(){
    return this.selectableMode;
  }
  getEnumArray(){
    return this.enumData;
  }
  getPointerIcon(pointerMode) {
    return "icon-tools-" + PointerIcon[pointerMode].toLowerCase();
  }
}
