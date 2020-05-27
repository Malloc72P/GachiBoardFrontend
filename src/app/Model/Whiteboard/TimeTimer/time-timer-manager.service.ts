import { Injectable } from '@angular/core';
import {TimeTimer} from './TimeTimer';
import {KanbanItem} from '../ProjectSupporter/Kanban/KanbanItem/kanban-item';
import {AreYouSurePanelService} from '../../PopupManager/AreYouSurePanelManager/are-you-sure-panel.service';
import {KanbanEventManagerService} from '../ProjectSupporter/Kanban/kanban-event-manager.service';

@Injectable({
  providedIn: 'root'
})
export class TimeTimerManagerService {
  public timeTimerMap:Map<any, TimeTimer>;
  public timerKeys:Array<any>;
  constructor(
    public areYouSurePanelService:AreYouSurePanelService,
  ) {
    this.timeTimerMap = new Map<any, TimeTimer>();
    this.timerKeys = new Array<any>();
  }

  startTimeTimer(kanbanItem:KanbanItem){
    if(!this.timeTimerMap.has(kanbanItem._id)){
      let newTimer = new TimeTimer(kanbanItem);
      this.timeTimerMap.set(kanbanItem._id, newTimer);
      this.timerKeys.push(kanbanItem._id);
    }else{
      this.areYouSurePanelService.openAreYouSurePanel("수행할 수 없는 명령입니다", "이미 타이머가 시작중입니다")
        .subscribe(()=>{});
    }
  }
  terminateTimer(timerId){
    this.timeTimerMap.delete(timerId);
    for(let i = 0 ; i < this.timerKeys.length; i++){
      let currId = this.timerKeys[i];
      if (currId === timerId){
        this.timerKeys.splice(i, 1);
        return;
      }
    }
  }

  getList(){
    return this.timeTimerMap.keys();
  }
}
