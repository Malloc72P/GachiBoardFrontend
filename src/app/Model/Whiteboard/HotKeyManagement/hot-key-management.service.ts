import {EventEmitter, Injectable, Output} from '@angular/core';

@Injectable({
  providedIn: 'root'
})
export class HotKeyManagementService {
  private _isAvail = true;
  @Output() hotKeyEventEmitter:EventEmitter<any> = new EventEmitter<any>();
  constructor() {

  }

  enableHotKeySystem(){
    this._isAvail = true;
  }
  disableHotKeySystem(){
    this._isAvail = false;
  }


  get isAvail(): boolean {
    return this._isAvail;
  }
}
