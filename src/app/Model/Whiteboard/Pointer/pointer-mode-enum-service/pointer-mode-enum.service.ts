import { Injectable } from '@angular/core';
import {CommonEnum} from '../../../Helper/common-enum/common-enum';
import {ShapeStyle} from '../../../Helper/data-type-enum/data-type.enum';

export enum PointerMode {
  MOVE,
  DRAW,
  HIGHLIGHTER,
  SHAPE,
  ERASER,
  LASSO_SELECTOR,
}

// /View\Whiteboard\whiteboard-tool-panel\whiteboard-tool-panel.component.css 에
// 등록한 클래스 'icon-tools-***' ***을 넣을것
export enum PointerIcon {
  move,
  brush,
  highlighter,
  shape,
  eraser,
  selector,
}

@Injectable({
  providedIn: 'root'
})

export class PointerModeEnumService implements CommonEnum {
  private enumData = PointerMode;
  private selectableMode:Array<string>;

  constructor() {
    this.selectableMode = new Array<any>();

    for( let key in this.enumData ){
      if(this.enumData.hasOwnProperty(key)) {
        let iterItem = this.enumData[key];
        if(!isNaN(Number(iterItem))){
          this.selectableMode.splice(this.selectableMode.length, 0, iterItem);
        }
      }
    }
  }
  getEnumEntryArray(){
    return this.selectableMode;
  }
  getEnumArray(){
    return this.enumData;
  }
  // getPointerIcon(pointerMode) {
  //   return "/assets/images/tools/" + PointerIcon[pointerMode].toLowerCase() + ".svg#" + PointerIcon[pointerMode].toLowerCase();
  // }
  getPointerIcon(pointerMode, shapeStyle?: number) {
    let iconName = PointerIcon[pointerMode].toLowerCase();
    if(pointerMode === PointerMode.SHAPE) {
      let shapeName = ShapeStyle[shapeStyle].toLowerCase();
      return iconName + '/' + shapeName + '.svg#' + shapeName;
    }
    return iconName + '.svg#' + iconName;
  }
}
