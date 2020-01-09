import {EventEmitter, Injectable, Output} from '@angular/core';

@Injectable({
  providedIn: 'root'
})
export class PopupManagerService {

  @Output() bgClicked:EventEmitter<any> = new EventEmitter<any>();
  constructor() {
  }
  public emitBgClickedEvent(){
    this.bgClicked.emit();
  }
  public getEventEmitter(){
    return this.bgClicked;
  }
}
