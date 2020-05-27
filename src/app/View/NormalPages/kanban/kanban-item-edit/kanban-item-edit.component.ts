import {Component, Inject, OnInit} from '@angular/core';
import {UserManagerService} from '../../../../Model/UserManager/user-manager.service';
import {FormControl, Validators} from '@angular/forms';
import {KanbanItemColorService} from '../../../../Model/Whiteboard/ProjectSupporter/Kanban/KanbanItemColorEnumManager/kanban-item-color.service';
import {KanbanItem} from '../../../../Model/Whiteboard/ProjectSupporter/Kanban/KanbanItem/kanban-item';
import {KanbanGroup} from '../../../../Model/Whiteboard/ProjectSupporter/Kanban/KanbanGroup/kanban-group';
import {WsKanbanController} from '../../../../Controller/Controller-WebSocket/websocket-manager/KanbanWsController/ws-kanban.controller';
import {MAT_DIALOG_DATA, MatDialogRef} from '@angular/material/dialog';
import * as moment from 'moment';

export class EditKanbanDialogData {
  kanbanItem:KanbanItem;
  kanbanGroup:KanbanGroup;
}

@Component({
  selector: 'app-kanban-item-edit',
  templateUrl: './kanban-item-edit.component.html',
  styleUrls: ['./kanban-item-edit.component.css']
})
export class KanbanItemEditComponent implements OnInit {
  kanbanItem         : KanbanItem;
  kanbanGroup        : KanbanGroup;
  userFormControl    : FormControl;
  colorFormControl   : FormControl;
  titleFormControl   : FormControl;
  startDateFormControl : FormControl;
  startTimeFormControl : FormControl;

  endDateFormControl : FormControl;
  endTimeFormControl : FormControl;

  minDate = new Date();

  selected = 0;
  constructor(
    public dialogRef: MatDialogRef<KanbanItemEditComponent>,
    public userManagerService:UserManagerService,
    public colorService:KanbanItemColorService,
    @Inject(MAT_DIALOG_DATA) public data: EditKanbanDialogData) {
    this.kanbanItem = data.kanbanItem;
    this.kanbanGroup = data.kanbanGroup;

    //console.log("KanbanItemEditComponent >> constructor >> this.kanbanItem : ",this.kanbanItem);

    this.titleFormControl = new FormControl(this.kanbanItem.title, [
      Validators.required,
    ]);
    this.colorFormControl = new FormControl(this.kanbanItem.getColorNumber());
    this.userFormControl = new FormControl(this.kanbanItem.userInfo.idToken);

    this.startDateFormControl = new FormControl(this.kanbanItem.timerStartDate);
    let startTime = moment(this.kanbanItem.timerStartDate).format('HH:mm A');
    this.startTimeFormControl = new FormControl(startTime);

    this.endDateFormControl = new FormControl(this.kanbanItem.timerEndDate);
    let endTime = moment(this.kanbanItem.timerEndDate).format('HH:mm A');
    this.endTimeFormControl = new FormControl(endTime);

    this.selected = this.colorFormControl.value;
  }

  ngOnInit(): void {
  }
  onNoClick(): void {
    let wsKanbanController = WsKanbanController.getInstance();
    wsKanbanController.requestUnlockKanban(this.kanbanItem, this.kanbanGroup);
    this.dialogRef.close();
  }
  onSubmit(){
    this.kanbanItem.userInfo = this.userManagerService.getUserDataByIdToken(
      this.userFormControl.value
    );
    this.kanbanItem.setColor(this.colorFormControl.value);
    this.kanbanItem.title = this.titleFormControl.value;

    this.kanbanItem.timerStartDate = this.mergeDateAndTime(this.startDateFormControl.value, this.startTimeFormControl.value);
    this.kanbanItem.timerEndDate = this.mergeDateAndTime(this.endDateFormControl.value, this.endTimeFormControl.value);

    let wsKanbanController = WsKanbanController.getInstance();
    wsKanbanController.waitRequestUpdateKanban(this.kanbanItem, this.kanbanGroup)
      .subscribe((data)=>{
        wsKanbanController.requestUnlockKanban(this.kanbanItem, this.kanbanGroup);
        this.dialogRef.close({
          kanbanItem : this.kanbanItem
        });
      },(e)=>{
        console.warn("KanbanItemEditComponent >> onSubmit >> e : ",e);
      });
  }
  onResetClick(){
    this.userFormControl.setValue(this.kanbanItem.userInfo.userName);
    this.titleFormControl.setValue(this.kanbanItem.title);
  }

  mergeDateAndTime(date, time){
    let endDate = moment(date, "YYYY-MM-DD").startOf("day");
    let endTime = moment(time, 'HH:mm A');
    endDate.add(endTime.hour(),"hour").add(endTime.minute(),"minute");

    //console.log(`endDate = ${endDate}\n endTime = ${endTime}`);
    return endDate.toDate();
  }
}
