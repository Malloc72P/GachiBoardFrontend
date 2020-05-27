import {Component, Input, OnDestroy, OnInit} from '@angular/core';
import {Subscription, timer} from 'rxjs';
import {TimeTimer} from '../../../Model/Whiteboard/TimeTimer/TimeTimer';
import * as moment from 'moment';
import {KanbanEventManagerService} from '../../../Model/Whiteboard/ProjectSupporter/Kanban/kanban-event-manager.service';
import {KanbanEvent, KanbanEventEnum} from '../../../Model/Whiteboard/ProjectSupporter/Kanban/KanbanEvent/KanbanEvent';
import {TimeTimerManagerService} from '../../../Model/Whiteboard/TimeTimer/time-timer-manager.service';
import {CommonSnackbarService} from '../../../Model/NormalPagesManager/common-snackbar/common-snackbar.service';

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
    public kanbanEventManagerService:KanbanEventManagerService,
    public timerManagerService:TimeTimerManagerService,
    public commonSnackbarService:CommonSnackbarService
  ) {

  }
  totalDifference = 0;
  timerProgress = 0;
  step = 0;
  ngOnInit(): void {
    this.initTimer();
    this.subscribeEvent();
  }
  initTimer(){
    this.totalDifference = moment(this.timeTimer.timerEndDate).diff(this.timeTimer.timerStartDate);
    let checkInterval = 1000;
    if(this.totalDifference <= 0){
      this.timerProgress = 100;
      return;
    }
    this.timerProgress = 0;
    this.step = 0.05 * this.totalDifference;
    this.rxjsTimer = timer( checkInterval, checkInterval);
    let currDate = new Date();
    // @ts-ignore
    let currProgress = moment(currDate).diff(this.timeTimer.timerStartDate);
    let alreadyProgressed = ((currProgress / this.step) * 5).toFixed(0) ;
    this.timerProgress += Number(alreadyProgressed);

    let stepCounter = 0;
    this.timerSubscription = this.rxjsTimer.subscribe((currentProgress)=>{
      stepCounter++;
      if( (stepCounter * 1000) === this.step){
        this.timerProgress += 5;
        stepCounter = 0;
      }
      if(moment(this.timeTimer.timerEndDate).diff(new Date()) <= 0){
        this.timerProgress = 100;
        this.commonSnackbarService.openSnackBar(`${this.timeTimer.title}의 타이머가 종료되었습니다`,"close");
        this.timerSubscription.unsubscribe();
      }

    });
  }
  ngOnDestroy(): void {
    if(this.subscription){
      this.subscription.unsubscribe();
    }
  }

  subscribeEvent(){
    this.subscription = this.kanbanEventManagerService.kanbanLocalEventEmitter.subscribe((kanbanEvent:KanbanEvent)=>{
      //console.log("TimeTimerComponent >> subscribeEvent >> kanbanEvent : ",kanbanEvent);
      if(this.timeTimer._id === kanbanEvent.kanbanItemDto._id){
        this.timeTimer.timerStartDate = kanbanEvent.kanbanItemDto.timerStartDate;
        this.timeTimer.timerEndDate = kanbanEvent.kanbanItemDto.timerEndDate;
        this.timeTimer.title = kanbanEvent.kanbanItemDto.title;
      }
      else return;

      switch (kanbanEvent.action) {
        case KanbanEventEnum.UPDATE:
          this.updateTimer();
          break;
        case KanbanEventEnum.DELETE:
          this.terminateTimer();
          break;
      }
    })
  }
  getTimerInfo(){
    return "남은시간 : " + this.makeMilliPretty(moment(this.timeTimer.timerEndDate).diff(new Date()));
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

  terminateTimer(){
    if(this.timerSubscription){
      this.timerSubscription.unsubscribe();
    }
    this.timerManagerService.terminateTimer(this.timeTimer._id);
    this.commonSnackbarService.openSnackBar(`${this.timeTimer.title}의 타이머가 종료되었습니다`,"close");
  }
  updateTimer(){
    //console.log("TimeTimerComponent >> updateTimer >> timeTimer : ",this.timeTimer);
    this.timerSubscription.unsubscribe();
    this.initTimer();
    this.commonSnackbarService.openSnackBar(`${this.timeTimer.title}의 타이머가 수정되었습니다`,"close");
  }

}
