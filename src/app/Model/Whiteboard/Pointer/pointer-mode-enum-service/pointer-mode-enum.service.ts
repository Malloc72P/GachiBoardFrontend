import { Injectable } from '@angular/core';

export enum PointerMode {
  MOVE,
  DRAW,
  LASSO_SELECTOR,
  ERASER
}

@Injectable({
  providedIn: 'root'
})

export class PointerModeEnumService {
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
}
