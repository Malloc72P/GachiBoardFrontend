import {EventEmitter, Injectable, Output} from '@angular/core';

@Injectable({
  providedIn: 'root'
})
export class WbSessionEventManagerService {
  @Output() wsWbSessionEventEmitter:EventEmitter<any> = new EventEmitter<any>();
  constructor() { }
}
