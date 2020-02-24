import {EventEmitter, Injectable, Output} from '@angular/core';

@Injectable({
  providedIn: 'root'
})
export class WbItemEventManagerService {
  @Output() wsWbItemEventEmitter:EventEmitter<any> = new EventEmitter<any>();
  constructor() {
    
  }
}
