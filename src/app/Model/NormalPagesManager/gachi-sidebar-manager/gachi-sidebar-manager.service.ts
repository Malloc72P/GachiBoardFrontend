import {EventEmitter, Injectable, Output} from '@angular/core';
import {GachiSidebarEvent, GachiSidebarEventEnum} from './GachiSidebarEvent/GachiSidebarEvent';

@Injectable({
  providedIn: 'root'
})
export class GachiSidebarManagerService {
  @Output() sidebarEventEmitter:EventEmitter<any> = new EventEmitter<any>();
  constructor() {

  }
  public openRightSidebar(){
    this.sidebarEventEmitter.emit(new GachiSidebarEvent(GachiSidebarEventEnum.OPEN_RIGHT_SIDEBAR));
  }
  public closeRightSidebar(){
    this.sidebarEventEmitter.emit(new GachiSidebarEvent(GachiSidebarEventEnum.CLOSE_RIGHT_SIDEBAR));
  }
  public openLeftSidebar(){
    this.sidebarEventEmitter.emit(new GachiSidebarEvent(GachiSidebarEventEnum.OPEN_LEFT_SIDEBAR));
  }
  public closeLeftSidebar(){
    this.sidebarEventEmitter.emit(new GachiSidebarEvent(GachiSidebarEventEnum.CLOSE_LEFT_SIDEBAR));
  }

  public toggleRightSidebar(){
    this.sidebarEventEmitter.emit(new GachiSidebarEvent(GachiSidebarEventEnum.TOGGLE_RIGHT_SIDEBAR));
  }
  public toggleLeftSidebar(){
    this.sidebarEventEmitter.emit(new GachiSidebarEvent(GachiSidebarEventEnum.TOGGLE_LEFT_SIDEBAR));
  }

}
