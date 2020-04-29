import { Component, OnInit } from '@angular/core';
import {Subscription, timer} from 'rxjs';
import {KanbanItem} from '../../../Model/Whiteboard/ProjectSupporter/Kanban/KanbanItem/kanban-item';

@Component({
  selector: 'app-time-timer',
  templateUrl: './time-timer.component.html',
  styleUrls: [
    './time-timer.component.css',
    './../../NormalPages/gachi-font.css'
  ]
})
export class TimeTimerComponent implements OnInit {
  timerSubscription: Subscription;
  timerSource;
  kanbanItem:KanbanItem;

  constructor() {

  }

  ngOnInit(): void {
  }

}
