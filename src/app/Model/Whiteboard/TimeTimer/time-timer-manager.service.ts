import { Injectable } from '@angular/core';
import {TimeTimer} from './TimeTimer';

@Injectable({
  providedIn: 'root'
})
export class TimeTimerManagerService {
  public timeTimerList:Array<TimeTimer>;
  constructor() {
    this.timeTimerList = new Array<TimeTimer>();

    for (let i = 0 ; i < 1 ; i++){
      this.timeTimerList.push(new TimeTimer());
    }
  }
}
