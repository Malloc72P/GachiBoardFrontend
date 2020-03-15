import { Injectable } from '@angular/core';
import {CommonEnum} from '../../../Helper/common-enum/common-enum';
import {PointerIcon} from '../../Pointer/pointer-mode-enum-service/pointer-mode-enum.service';

export enum SupportMode {
  KANBAN,
  TIME_TIMER,
  CLOUD_STORAGE,
  IMPORT,
  EXPORT,
  TEXT_CHAT,
  VIDEO_CHAT,
  CURSOR_TRACKER,
}
export enum SupporterIcon {
  kanban,
  time_timer,
  cloud_storage,
  import,
  export,
  text_chat,
  video_chat,
  cursor_tracker,
}


@Injectable({
  providedIn: 'root'
})
export class ProjectSupporterEnumService  implements CommonEnum {
  private enumData = SupportMode;
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
  getSupporterIcon(supporterMode) {
    return "icon-tools-" + SupporterIcon[supporterMode].toLowerCase();
  }
}
