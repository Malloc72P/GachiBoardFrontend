import {EventEmitter, Injectable, Output} from '@angular/core';

@Injectable({
  providedIn: 'root'
})
export class KanbanEventManagerService {
  @Output() kanbanEventEmitter:EventEmitter<any> = new EventEmitter<any>();

  constructor() { }
}
