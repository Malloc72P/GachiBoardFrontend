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
  constructor(
    public areYouSurePanelService:AreYouSurePanelService,
  ) {
    this.timeTimerMap = new Map<any, TimeTimer>();

  }

  startTimeTimer(kanbanItem:KanbanItem, kanbanGroup){
    if(!this.timeTimerMap.has(kanbanItem._id)){
      let newTimer = new TimeTimer(kanbanItem, kanbanGroup);
      this.timeTimerMap.set(kanbanItem._id, newTimer);
    }else{
      this.areYouSurePanelService.openAreYouSurePanel("수행할 수 없는 명령입니다", "이미 타이머가 시작중입니다")
        .subscribe(()=>{});
    }
  }
}
