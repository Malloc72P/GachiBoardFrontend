import {EventEmitter, Injectable, Output} from '@angular/core';

@Injectable({
  providedIn: 'root'
})
export class HotKeyManagementService {
  private _isAvail = true;
  private _isCloud = false;
  @Output() hotKeyEventEmitter:EventEmitter<any> = new EventEmitter<any>();
  constructor() {

  }

  enableHotKeySystem(){
    this._isAvail = true;
  }
  disableHotKeySystem(){
    this._isAvail = false;
  }
  enableCloudMode(){
    this._isCloud = true;
  }
  disableCloudMode(){
    this._isCloud = false;
  }


  get isAvail(): boolean {
    return this._isAvail;
  }

  get isCloud(): boolean {
    return this._isCloud;
  }
}
