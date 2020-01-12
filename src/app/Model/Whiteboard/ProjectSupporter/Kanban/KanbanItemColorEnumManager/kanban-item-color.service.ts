import { Injectable } from '@angular/core';
import {CommonEnum} from '../../../../Helper/common-enum/common-enum';
export enum KanbanItemColor {
  RED,
  BLUE,
  ORANGE,
  BLACK,
}
@Injectable({
  providedIn: 'root'
})
export class KanbanItemColorService implements CommonEnum {
  private enumData = KanbanItemColor;
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
  getEnumData(){
    return this.enumData;
  }
  getEnumEntryArray(){
    return this.selectableMode;
  }
  getEnumArray(){
    return this.enumData;
  }
}
