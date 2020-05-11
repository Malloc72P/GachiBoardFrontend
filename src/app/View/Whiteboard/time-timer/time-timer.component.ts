import {Component, Input, OnDestroy, OnInit} from '@angular/core';
import {Subscription, timer} from 'rxjs';
import {KanbanItem} from '../../../Model/Whiteboard/ProjectSupporter/Kanban/KanbanItem/kanban-item';
import {TimeTimer} from '../../../Model/Whiteboard/TimeTimer/TimeTimer';
import * as moment from 'moment';
import {KanbanEventManagerService} from '../../../Model/Whiteboard/ProjectSupporter/Kanban/kanban-event-manager.service';
import {KanbanEvent, KanbanEventEnum} from '../../../Model/Whiteboard/ProjectSupporter/Kanban/KanbanEvent/KanbanEvent';

@Component({
  selector: 'app-time-timer',
  templateUrl: './time-timer.component.html',
  styleUrls: [
    './time-timer.component.css',
    './../../NormalPages/gachi-font.css'
  ]
})
export class TimeTimerComponent implements OnInit, OnDestroy {
  timerSubscription: Subscription;
  rxjsTimer;

  @Input() timeTimer:TimeTimer;
  subscription:Subscription;
  constructor(
    public kanbanEventManagerService:KanbanEventManagerService
  ) {

  }
  totalDifference = 0;
  timerProgress = 0;
  step = 0;
  ngOnInit(): void {
    console.log(`start Date : ${moment(this.timeTimer.kanbanItem.timerStartDate)}\n end Date : ${moment(this.timeTimer.kanbanItem.timerEndDate)}`);
    this.totalDifference = moment(this.timeTimer.kanbanItem.timerEndDate).diff(this.timeTimer.kanbanItem.timerStartDate);

    if(this.totalDifference <= 0){
      this.timerProgress = 100;
      return;
    }
    this.step = 0.05 * this.totalDifference;
    this.rxjsTimer = timer( this.step, this.step);
    let currDate = new Date();
    // @ts-ignore
    let currProgress = moment(currDate).diff(this.timeTimer.kanbanItem.timerStartDate);
    let alreadyProgressed = ((currProgress / this.step) * 5).toFixed(0) ;
    this.timerProgress += Number(alreadyProgressed);
    this.timerSubscription = this.rxjsTimer.subscribe((currentProgress)=>{
      console.log(`currentProgress is ${currentProgress}`);
      if(currentProgress === 19){
        this.timerSubscription.unsubscribe();
      }
      this.timerProgress += 5;
    });
  }
  ngOnDestroy(): void {
    if(this.subscription){
      this.subscription.unsubscribe();
    }
  }

  subscribeEvent(){
    this.subscription = this.kanbanEventManagerService.kanbanEventEmitter.subscribe((kanbanEvent:KanbanEvent)=>{
      switch (kanbanEvent.action) {
        case KanbanEventEnum.UPDATE:
          break;
        case KanbanEventEnum.DELETE:
          break;
      }
    })
  }
  getTimerInfo(){
    return "남은시간 : " + this.makeMilliPretty(moment(this.timeTimer.kanbanItem.timerEndDate).diff(new Date()));
  }

  makeMilliPretty(dateDiff) {
    //                           날   시   분    초
    if(dateDiff < 0){
      return "종료됨";
    }
    let result = "";
    let day     = (dateDiff / (24 * 60 * 60 * 1000));
    // @ts-ignore
    day = day.toFixed(0);
    let hour    = dateDiff / (     60 * 60 * 1000);
    // @ts-ignore
    hour = hour.toFixed(0);
    let minute  = (dateDiff - (hour * 60 * 60 * 1000)) / (60 * 1000);
    // @ts-ignore
    minute = minute.toFixed(0);

    if(day > 0){
      result += `${day}일`;
    }else{
      result += `${hour}시 ${minute}분`;
    }
    return result;
  }

}
